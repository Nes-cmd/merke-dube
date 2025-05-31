<?php

namespace App\Http\Controllers;

use App\Models\Shop;
use App\Models\ShopInventory;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $shops = Shop::where('owner_id', $user->works_for)
            ->withCount('sales')
            ->get();
        
        return Inertia::render('Shops', [
            'shops' => $shops
        ]);
    }
    
    public function show($id)
    {
        $user = auth()->user();
        $shop = Shop::with('inventory.item')->findOrFail($id);
        
        // Ensure shop belongs to the user's owner
        if ($shop->owner_id !== $user->works_for) {
            return redirect()->route('shops.index')
                ->with('error', 'You do not have permission to view this shop');
        }
        
        return Inertia::render('ShopDetail', [
            'shop' => $shop
        ]);
    }
    
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'description' => 'nullable|string',
        ]);
        
        Shop::create([
            'name' => $request->name,
            'location' => $request->location,
            'phone' => $request->phone,
            'description' => $request->description,
            'owner_id' => $user->works_for,
            'is_active' => true,
        ]);
        
        return redirect()->back()->with('message', 'Shop added successfully');
    }
    
    public function destroy($id)
    {
        $user = auth()->user();
        $shop = Shop::findOrFail($id);
        
        // Ensure shop belongs to the user's owner
        if ($shop->owner_id !== $user->works_for) {
            return redirect()->route('shops.index')
                ->with('error', 'You do not have permission to delete this shop');
        }
        
        // Check if shop has sales
        if ($shop->sales()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete shop with sales history');
        }
        
        $shop->delete();
        
        return redirect()->back()->with('message', 'Shop deleted successfully');
    }
    
    public function addInventory(Request $request, $shopId)
    {
        $user = auth()->user();
        $shop = Shop::findOrFail($shopId);
        
        // Ensure shop belongs to the user's owner
        if ($shop->owner_id !== $user->works_for) {
            return redirect()->route('shops.index')
                ->with('error', 'You do not have permission to manage this shop');
        }
        
        $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'selling_price' => 'required|numeric|min:0',
        ]);
        
        // Check if item already exists in shop inventory
        $existing = ShopInventory::where('shop_id', $shopId)
            ->where('item_id', $request->item_id)
            ->first();
            
        if ($existing) {
            // Update quantity
            $existing->quantity += $request->quantity;
            $existing->selling_price = $request->selling_price;
            $existing->save();
        } else {
            // Create new inventory item
            ShopInventory::create([
                'shop_id' => $shopId,
                'item_id' => $request->item_id,
                'quantity' => $request->quantity,
                'selling_price' => $request->selling_price,
            ]);
        }
        
        // Reduce quantity from warehouse inventory
        $item = Item::findOrFail($request->item_id);
        $item->quantity -= $request->quantity;
        $item->save();
        
        return redirect()->back()->with('message', 'Inventory added successfully');
    }
    
    public function removeInventory(Request $request, $shopId, $inventoryId)
    {
        $user = auth()->user();
        $inventory = ShopInventory::with('shop')->findOrFail($inventoryId);
        
        // Ensure shop belongs to the user's owner
        if ($inventory->shop->owner_id !== $user->works_for) {
            return redirect()->route('shops.index')
                ->with('error', 'You do not have permission to manage this shop');
        }
        
        // Return inventory to warehouse
        $item = Item::findOrFail($inventory->item_id);
        $item->quantity += $inventory->quantity;
        $item->save();
        
        // Remove from shop inventory
        $inventory->delete();
        
        return redirect()->back()->with('message', 'Inventory removed successfully');
    }
} 