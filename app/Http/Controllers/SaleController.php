<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Item;
use App\Http\Requests\PaySaleCreditRequest;
use App\Models\CreditHistory;
use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Customer;
use App\Models\Shop;
use App\Models\ShopInventory;

class SaleController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $sales = Sale::where('owner_id', $user->works_for)
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get available products for new sale form
        $products = Item::where('owner_id', $user->works_for)
            ->where('quantity', '>', 0)
            ->get();
        
        return Inertia::render('Sales', [
            'sales' => $sales,
            'products' => $products
        ]);
    }
    
    public function show($id)
    {
        $sale = Sale::with('customer', 'item')->findOrFail($id);
        
        return Inertia::render('SaleDetail', [
            'sale' => $sale
        ]);
    }
    
    public function create()
    {
        $user = auth()->user();
        
        // Get the user's shops
        $shops = Shop::where('owner_id', $user->works_for)
            ->where('is_active', true)
            ->get();
        
        // Get customers for dropdown
        $customers = Customer::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('SaleCreate', [
            'shops' => $shops,
            'customers' => $customers
        ]);
    }
    
    public function creditPayed(PaySaleCreditRequest $request, $id)
    {
        $sale = Sale::find($id);
        $sale->paid = $sale->paid + $request->credit_payed;
        $sale->credit = $sale->credit - $request->credit_payed;
        
        if($sale->credit == 0) {
            $sale->status = PaymentStatus::Completed;
        }

        $sale->save();

        CreditHistory::create([
            'creditable_type' => Sale::class,
            'creditable_id' => $sale->id,
            'value' => $request->credit_payed,
            'approver_id' => auth()->id(),
            'note' => $request->note,
            'owner_id' => $sale->owner_id,
        ]);

        return redirect()->back()->with('message', 'Credit paid successfully');
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'inventory_id' => 'required|exists:shop_inventories,id',
            'quantity' => 'required|integer|min:1',
            'paid' => 'required|numeric|min:0',
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'note' => 'nullable|string',
        ]);
        
        // Get shop inventory item
        $inventory = ShopInventory::with('item')->findOrFail($request->inventory_id);
        
        // Check if shop belongs to user's owner
        $shop = Shop::findOrFail($request->shop_id);
        if ($shop->owner_id !== $user->works_for) {
            return redirect()->back()->with('error', 'You do not have permission to create sales for this shop');
        }
        
        // Check if there's enough inventory
        if ($inventory->quantity < $request->quantity) {
            return redirect()->back()->with('error', 'Not enough inventory available');
        }
        
        // Calculate total and credit
        $total = $inventory->selling_price * $request->quantity;
        $credit = $total - $request->paid;
        
        // Create customer if provided
        $customerId = null;
        if ($request->customer_name || $request->customer_phone) {
            $customer = Customer::firstOrCreate(
                ['phone' => $request->customer_phone ?: null],
                ['name' => $request->customer_name ?: 'Unknown', 'owner_id' => $user->works_for]
            );
            $customerId = $customer->id;
        }
        
        // Create sale with customer_id if provided
        $sale = Sale::create([
            'shop_id' => $request->shop_id,
            'item_id' => $inventory->item_id,
            'item_name' => $inventory->item->name,
            'quantity' => $request->quantity,
            'total' => $total,
            'paid' => $request->paid,
            'credit' => $credit,
            'customer_id' => $request->customer_id,
            'owner_id' => $user->works_for,
            'note' => $request->note,
            'status' => $credit > 0 ? PaymentStatus::Pending : PaymentStatus::Completed,
        ]);
        
        // Update inventory
        $inventory->quantity -= $request->quantity;
        $inventory->save();
        
        return redirect()->route('sales.index')->with('message', 'Sale created successfully');
    }
} 