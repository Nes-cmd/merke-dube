<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $warehouses = Store::with('owner')
            ->withCount('items')
            ->where('owner_id', $user->works_for)
            ->get();
        
        return Inertia::render('Warehouses', [
            'warehouses' => $warehouses
        ]);
    }
    
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);
        
        Store::create([
            'name' => $request->name,
            'location' => $request->location,
            'owner_id' => $user->works_for,
        ]);
        
        return redirect()->back()->with('message', 'Warehouse added successfully');
    }
    
    public function destroy($id)
    {
        $store = Store::with('items')->findOrFail($id);
        
        if ($store->items->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete warehouse with items');
        }
        
        $store->delete();
        
        return redirect()->back()->with('message', 'Warehouse deleted successfully');
    }
} 