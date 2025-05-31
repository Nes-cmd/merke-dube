<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Store;
use App\Models\ItemImage;
use App\Models\ItemRefill;
use App\Http\Requests\PayCreditRequest;
use App\Models\CreditHistory;
use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $products = Item::with('category', 'store', 'supplier', 'images')
            ->where('owner_id', $user->works_for)
            ->get();
        
        // Get all warehouses for the tabs
        $warehouses = Store::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('Products', [
            'products' => $products,
            'warehouses' => $warehouses
        ]);
    }
    
    public function show($id)
    {
        $user = auth()->user();
        $product = Item::with(['category', 'store', 'supplier'])->findOrFail($id);
        
        // Ensure product belongs to user's organization
        if ($product->owner_id !== $user->works_for) {
            return redirect()->route('products.index')->with('error', 'You do not have permission to view this product');
        }
        
        // Get images for this product
        $images = ItemImage::where('item_id', $id)->orderBy('sort_order')->get();
        
        // Get refill history
        $refills = ItemRefill::with('supplier')
            ->where('item_id', $id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return Inertia::render('ProductDetail', [
            'product' => $product,
            'images' => $images,
            'refills' => $refills
        ]);
    }
    
    public function create()
    {
        $user = auth()->user();
        
        return Inertia::render('ProductCreate', [
            'categories' => Category::where('owner_id', $user->works_for)->get(),
            'warehouses' => Store::where('owner_id', $user->works_for)->get(),
            'suppliers' => Customer::where('owner_id', $user->works_for)
                // ->where('is_supplier', true)
                ->get()
        ]);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'store_id' => 'required|exists:stores,id',
            'supplier_id' => 'nullable|exists:customers,id',
            'unit_price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'barcode' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
            'images.*' => 'nullable|image|max:2048'
        ]);
        
        $user = auth()->user();
        
        // Create the item
        $item = Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => $user->works_for,
            'category_id' => $request->category_id,
            'store_id' => $request->store_id,
            'supplier_id' => $request->supplier_id,
            'unit_price' => $request->unit_price,
            'cost_price' => $request->cost_price,
            'quantity' => $request->quantity,
            'barcode' => $request->barcode,
            'sku' => $request->sku ?: Str::random(8),
            'created_by' => $user->id,
        ]);
        
        // Handle image uploads
        if ($request->hasFile('images')) {
            $primarySet = false;
            $sortOrder = 0;
            
            foreach ($request->file('images') as $imageFile) {
                $path = $imageFile->store('product-images', 'public');
                
                ItemImage::create([
                    'item_id' => $item->id,
                    'image_path' => $path,
                    'is_primary' => !$primarySet,
                    'sort_order' => $sortOrder++
                ]);
                
                if (!$primarySet) {
                    $primarySet = true;
                }
            }
        }
        
        // Record initial inventory as a refill
        if ($request->quantity > 0) {
            ItemRefill::create([
                'item_id' => $item->id,
                'quantity' => $request->quantity,
                'purchase_price' => $request->cost_price ?: 0,
                'supplier_id' => $request->supplier_id,
                'refilled_by' => $user->id,
                'note' => 'Initial inventory'
            ]);
        }
        
        return redirect()->route('products.index')
            ->with('message', 'Product created successfully');
    }
    
    public function creditPayed(PayCreditRequest $request, $id)
    {
        $item = Item::find($id);
        $item->paid = $item->paid + $request->credit_payed;
        $item->credit = $item->credit - $request->credit_payed;
        
        if($item->credit == 0){
            $item->status = PaymentStatus::Completed;
        }

        $item->save();

        CreditHistory::create([
            'creditable_type' => Item::class,
            'creditable_id' => $item->id,
            'value' => $request->credit_payed,
            'approver_id' => auth()->id(),
            'note' => $request->note,
            'owner_id' => $item->owner_id,
        ]);

        return redirect()->back()->with('message', 'Credit paid successfully');
    }
    
    public function refill($id)
    {
        $user = auth()->user();
        $item = Item::with('supplier')->findOrFail($id);
        
        // Ensure item belongs to user's organization
        if ($item->owner_id !== $user->works_for) {
            return redirect()->route('products.index')->with('error', 'You do not have permission to refill this item');
        }
        
        // Get suppliers for dropdown
        $suppliers = Customer::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('ProductRefill', [
            'item' => $item,
            'suppliers' => $suppliers
        ]);
    }
    
    public function storeRefill(Request $request, $id)
    {
        $user = auth()->user();
        $item = Item::findOrFail($id);
        
        // Ensure item belongs to user's organization
        if ($item->owner_id !== $user->works_for) {
            return redirect()->route('products.index')->with('error', 'You do not have permission to refill this item');
        }
        
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'purchase_price' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:customers,id',
            'batch_number' => 'nullable|string|max:255',
            'manufacture_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:manufacture_date',
            'notes' => 'nullable|string',
        ]);
        
        // Create refill record
        ItemRefill::create([
            'item_id' => $item->id,
            'quantity' => $request->quantity,
            'purchase_price' => $request->purchase_price,
            'supplier_id' => $request->supplier_id,
            'batch_number' => $request->batch_number,
            'manufacture_date' => $request->manufacture_date,
            'expiry_date' => $request->expiry_date,
            'notes' => $request->notes,
            'refilled_by' => $user->id,
        ]);
        
        // Update item
        $item->quantity += $request->quantity;
        $item->refill_count += 1;
        $item->last_refill_date = now();
        
        // Update batch info if provided
        if ($request->batch_number) {
            $item->batch_number = $request->batch_number;
        }
        if ($request->manufacture_date) {
            $item->manufacture_date = $request->manufacture_date;
        }
        if ($request->expiry_date) {
            $item->expiry_date = $request->expiry_date;
        }
        
        // Update purchase price if changed
        if ($request->purchase_price && $request->purchase_price != $item->purchase_price) {
            $item->purchase_price = $request->purchase_price;
        }
        
        $item->save();
        
        return redirect()->route('products.show', $item->id)->with('message', 'Product refilled successfully');
    }
    
    public function uploadImages(Request $request, $id)
    {
        $user = auth()->user();
        $item = Item::findOrFail($id);
        
        // Ensure item belongs to user's organization
        if ($item->owner_id !== $user->works_for) {
            return redirect()->route('products.index')->with('error', 'You do not have permission to update this item');
        }
        
        $request->validate([
            'images.*' => 'required|image|max:2048',
            'is_primary' => 'nullable|integer',
        ]);
        
        $uploadedImages = [];
        $maxSortOrder = ItemImage::where('item_id', $item->id)->max('sort_order') ?? 0;
        
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('products', 'public');
                
                // Determine if this image is primary
                $isPrimary = ($request->is_primary !== null && $request->is_primary == $index);
                
                // If making a new primary, update all others
                if ($isPrimary) {
                    ItemImage::where('item_id', $item->id)
                        ->where('is_primary', true)
                        ->update(['is_primary' => false]);
                }
                
                // Create image record
                $itemImage = ItemImage::create([
                    'item_id' => $item->id,
                    'image_path' => $path,
                    'is_primary' => $isPrimary || ($index === 0 && ItemImage::where('item_id', $item->id)->count() === 0),
                    'sort_order' => $maxSortOrder + $index + 1,
                ]);
                
                $uploadedImages[] = $itemImage;
            }
        }
        
        return response()->json([
            'message' => 'Images uploaded successfully',
            'images' => $uploadedImages,
        ]);
    }
    
    public function deleteImage(Request $request, $id, $imageId)
    {
        $user = auth()->user();
        $item = Item::findOrFail($id);
        
        // Ensure item belongs to user's organization
        if ($item->owner_id !== $user->works_for) {
            return response()->json(['error' => 'You do not have permission to update this item'], 403);
        }
        
        $image = ItemImage::where('item_id', $id)->findOrFail($imageId);
        
        // Delete file from storage
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }
        
        // If deleting primary image, make another one primary
        if ($image->is_primary) {
            $newPrimary = ItemImage::where('item_id', $id)
                ->where('id', '!=', $imageId)
                ->first();
                
            if ($newPrimary) {
                $newPrimary->is_primary = true;
                $newPrimary->save();
            }
        }
        
        $image->delete();
        
        return response()->json(['message' => 'Image deleted successfully']);
    }
    
    public function updateImageOrder(Request $request, $id)
    {
        $user = auth()->user();
        $item = Item::findOrFail($id);
        
        // Ensure item belongs to user's organization
        if ($item->owner_id !== $user->works_for) {
            return response()->json(['error' => 'You do not have permission to update this item'], 403);
        }
        
        $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:item_images,id',
            'images.*.sort_order' => 'required|integer|min:0',
        ]);
        
        foreach ($request->images as $imageData) {
            ItemImage::where('id', $imageData['id'])
                ->where('item_id', $id)
                ->update(['sort_order' => $imageData['sort_order']]);
        }
        
        return response()->json(['message' => 'Image order updated successfully']);
    }
    
    public function setPrimaryImage(Request $request, $id, $imageId)
    {
        $user = auth()->user();
        $item = Item::findOrFail($id);
        
        // Ensure item belongs to user's organization
        if ($item->owner_id !== $user->works_for) {
            return response()->json(['error' => 'You do not have permission to update this item'], 403);
        }
        
        // Update all images to not primary
        ItemImage::where('item_id', $id)
            ->update(['is_primary' => false]);
            
        // Set the selected image as primary
        ItemImage::where('item_id', $id)
            ->where('id', $imageId)
            ->update(['is_primary' => true]);
            
        return response()->json(['message' => 'Primary image updated successfully']);
    }
    
    public function edit($id)
    {
        $user = auth()->user();
        $product = Item::findOrFail($id);
        
        // Ensure product belongs to user's organization
        if ($product->owner_id !== $user->works_for) {
            return redirect()->route('products.index')->with('error', 'You do not have permission to edit this product');
        }
        
        // Get categories for dropdown
        $categories = Category::where('owner_id', $user->works_for)->get();
        
        // Get warehouses for dropdown
        $warehouses = Store::where('owner_id', $user->works_for)->get();
        
        // Get suppliers for dropdown
        $suppliers = Customer::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('ProductEdit', [
            'product' => $product,
            'categories' => $categories,
            'warehouses' => $warehouses,
            'suppliers' => $suppliers
        ]);
    }
    
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $product = Item::findOrFail($id);
        
        // Ensure product belongs to user's organization
        if ($product->owner_id !== $user->works_for) {
            return redirect()->route('products.index')->with('error', 'You do not have permission to edit this product');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'selling_price' => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'store_id' => 'required|exists:stores,id',
            'supplier_id' => 'nullable|exists:customers,id',
            'barcode' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:255',
        ]);
        
        // Update product
        $product->update([
            'name' => $request->name,
            'description' => $request->description,
            'selling_price' => $request->selling_price,
            'category_id' => $request->category_id,
            'store_id' => $request->store_id,
            'supplier_id' => $request->supplier_id,
            'barcode' => $request->barcode,
            'sku' => $request->sku,
        ]);
        
        return redirect()->route('products.show', $product->id)->with('message', 'Product updated successfully');
    }
} 