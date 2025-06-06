<?php

namespace App\Http\Controllers;

use App\Models\ShopInventory;
use App\Models\Shop;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get all inventory across all shops with relationships
        $inventory = ShopInventory::with(['shop', 'item', 'item.category', 'item.images'])
            ->whereHas('shop', function ($query) use ($user) {
                $query->where('owner_id', $user->works_for);
            })
            ->get();
        
        // Get shops for filtering
        $shops = Shop::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('Inventory', [
            'inventory' => $inventory,
            'shops' => $shops
        ]);
    }
    
    public function create()
    {
        $user = auth()->user();
        
        // Get shops for the form
        $shops = Shop::where('owner_id', $user->works_for)
            ->where('is_active', true)
            ->get();
        
        // Get items that can be added to inventory
        $items = Item::where('owner_id', $user->works_for)
            ->where('quantity', '>', 0)
            ->get();
        
        return Inertia::render('InventoryCreate', [
            'shops' => $shops,
            'items' => $items
        ]);
    }
    
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'selling_price' => 'required|numeric|min:0',
        ]);
        
        // Check if shop belongs to user's organization
        $shop = Shop::findOrFail($request->shop_id);
        if ($shop->owner_id !== $user->works_for) {
            return redirect()->back()->with('error', 'You do not have permission to add inventory to this shop');
        }
        
        // Check if item belongs to user's organization
        $item = Item::findOrFail($request->item_id);
        if ($item->owner_id !== $user->works_for) {
            return redirect()->back()->with('error', 'You do not have permission to use this item');
        }
        
        // Check if there's enough inventory in the warehouse
        if ($item->quantity < $request->quantity) {
            return redirect()->back()->with('error', 'Not enough inventory in warehouse');
        }
        
        // Check if this item already exists in this shop's inventory
        $existingInventory = ShopInventory::where('shop_id', $request->shop_id)
            ->where('item_id', $request->item_id)
            ->first();
            
        if ($existingInventory) {
            // Update existing inventory
            $existingInventory->quantity += $request->quantity;
            $existingInventory->selling_price = $request->selling_price;
            $existingInventory->save();
        } else {
            // Create new inventory entry
            ShopInventory::create([
                'shop_id' => $request->shop_id,
                'item_id' => $request->item_id,
                'quantity' => $request->quantity,
                'selling_price' => $request->selling_price,
            ]);
        }
        
        // Reduce warehouse inventory
        $item->quantity -= $request->quantity;
        $item->save();
        
        return redirect()->route('inventory.index')->with('message', 'Inventory added successfully');
    }
    
    public function edit($id)
    {
        $user = auth()->user();
        
        // Get the inventory item with relationships
        $inventory = ShopInventory::with(['shop', 'item'])
            ->findOrFail($id);
        
        // Ensure shop belongs to user's organization
        if ($inventory->shop->owner_id !== $user->works_for) {
            return redirect()->route('inventory.index')
                ->with('error', 'You do not have permission to edit this inventory item');
        }
        
        // Get shops for dropdown
        $shops = Shop::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('InventoryEdit', [
            'inventory' => $inventory,
            'shops' => $shops
        ]);
    }
    
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);
        
        $inventory = ShopInventory::with('shop')->findOrFail($id);
        
        // Ensure shop belongs to user's organization
        if ($inventory->shop->owner_id !== $user->works_for) {
            return redirect()->route('inventory.index')
                ->with('error', 'You do not have permission to update this inventory item');
        }
        
        // Update inventory
        $inventory->quantity = $request->quantity;
        $inventory->save();
        
        return redirect()->route('inventory.index')
            ->with('message', 'Inventory updated successfully');
    }
    
    public function destroy($id)
    {
        $user = auth()->user();
        $inventory = ShopInventory::with(['shop', 'item'])->findOrFail($id);
        
        // Check if shop belongs to user's organization
        if ($inventory->shop->owner_id !== $user->works_for) {
            return redirect()->back()->with('error', 'You do not have permission to delete this inventory');
        }
        
        // Return quantity to warehouse
        $inventory->item->quantity += $inventory->quantity;
        $inventory->item->save();
        
        // Delete inventory
        $inventory->delete();
        
        return redirect()->back()->with('message', 'Inventory removed successfully');
    }

    public function refill(Request $request, $id)
    {
        $user = auth()->user();
        
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);
        
        // Get the inventory item with relationships
        $inventory = ShopInventory::with(['shop', 'item'])->findOrFail($id);
        
        // Ensure shop belongs to user's organization
        if ($inventory->shop->owner_id !== $user->works_for) {
            return response()->json([
                'message' => 'You do not have permission to refill this inventory item'
            ], 403);
        }
        
        // Check if warehouse has enough stock
        if ($inventory->item->quantity < $request->quantity) {
            return response()->json([
                'message' => 'Not enough inventory in warehouse'
            ], 422);
        }
        
        // Update shop inventory
        $inventory->quantity += $request->quantity;
        $inventory->save();
        
        // Reduce warehouse inventory
        $inventory->item->quantity -= $request->quantity;
        $inventory->item->save();
        
        return response()->json([
            'message' => 'Inventory refilled successfully',
            'inventory' => $inventory
        ]);
    }
} 