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
        $products = Item::where('owner_id', $user->works_for)
            ->where('quantity', '>', 0)
            ->get();
            
        return Inertia::render('SaleCreate', [
            'products' => $products
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
            'item_id' => 'required|exists:items,id',
            'item_name' => 'required|string',
            'quantity' => 'required|integer|min:1',
            'total' => 'required|numeric|min:0',
            'paid' => 'required|numeric|min:0',
            'credit' => 'required|numeric|min:0',
            'customer_name' => 'nullable|string',
            'customer_phone' => 'nullable|string',
            'note' => 'nullable|string',
        ]);
        
        // Reduce product quantity
        $item = Item::findOrFail($request->item_id);
        if ($item->quantity < $request->quantity) {
            return back()->withErrors(['quantity' => 'Not enough items in stock']);
        }
        
        $item->quantity -= $request->quantity;
        $item->save();
        
        // Create customer if provided
        $customerId = null;
        if ($request->customer_name || $request->customer_phone) {
            $customer = Customer::firstOrCreate(
                ['phone' => $request->customer_phone ?: null],
                ['name' => $request->customer_name ?: 'Unknown', 'owner_id' => $user->works_for]
            );
            $customerId = $customer->id;
        }
        
        // Create sale
        $sale = Sale::create([
            'item_id' => $request->item_id,
            'item_name' => $request->item_name,
            'quantity' => $request->quantity,
            'total' => $request->total,
            'paid' => $request->paid,
            'credit' => $request->credit,
            'customer_id' => $customerId,
            'owner_id' => $user->works_for,
            'note' => $request->note,
            'status' => $request->credit > 0 ? PaymentStatus::Pending : PaymentStatus::Completed,
        ]);
        
        return redirect()->route('sales.index')->with('message', 'Sale created successfully');
    }
} 