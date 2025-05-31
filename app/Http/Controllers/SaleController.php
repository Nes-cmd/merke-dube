<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Item;
use App\Models\Shop;
use App\Models\ShopInventory;
use App\Models\Customer;
use App\Models\CreditSale;
use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class SaleController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $sales = Sale::where('owner_id', $user->works_for)
            ->with(['customer', 'shop', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        // Get shops for dropdown
        $shops = Shop::where('owner_id', $user->works_for)->get();
        
        // Get customers for dropdown
        $customers = Customer::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('Sales', [
            'sales' => $sales,
            'shops' => $shops,
            'customers' => $customers
        ]);
    }
    
    public function show($id)
    {
        $sale = Sale::with(['customer', 'shop', 'approvedBy'])->findOrFail($id);
        
        return Inertia::render('SaleDetail', [
            'sale' => $sale
        ]);
    }
    
    public function getShopInventory($shopId)
    {
        $inventory = ShopInventory::with(['item' => function($query) {
            $query->with('category', 'images');
        }])
        ->where('shop_id', $shopId)
        ->where('quantity', '>', 0)
        ->get();
        
        return response()->json($inventory);
    }
    
    public function store(Request $request)
    {
        $user = auth()->user();
        
        try {
            $validated = $request->validate([
                'shop_id' => 'required|exists:shops,id',
                'items' => 'required|array|min:1',
                'items.*.item_id' => 'required|exists:items,id',
                'items.*.inventory_id' => 'required|exists:shop_inventories,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'customer_id' => 'nullable|exists:customers,id',
                'amount_paid' => 'required|numeric|min:0',
                'note' => 'nullable|string',
            ]);
            
            DB::beginTransaction();
            
            $totalAmount = 0;
            $items = [];
            
            // Calculate total amount and prepare items for processing
            foreach ($request->items as $item) {
                // Fetch the inventory using inventory_id rather than searching
                $inventory = ShopInventory::findOrFail($item['inventory_id']);
                    
                // Double-check shop_id and item_id match
                if ($inventory->shop_id != $request->shop_id || $inventory->item_id != $item['item_id']) {
                    throw new \Exception('Invalid inventory item');
                }
                    
                // Check if there's enough inventory
                if ($inventory->quantity < $item['quantity']) {
                    throw new \Exception('Not enough inventory for item #' . $item['item_id']);
                }
                
                $totalAmount += $item['price'] * $item['quantity'];
                $items[] = [
                    'inventory' => $inventory,
                    'quantity' => $item['quantity'],
                    'price' => $item['price']
                ];
            }
            
            // Determine payment status
            $amountPaid = $request->amount_paid;
            $credit = max(0, $totalAmount - $amountPaid);
            $paymentStatus = $credit > 0 ? PaymentStatus::Partial : PaymentStatus::Completed;
            
            // Create sale record
            $sale = Sale::create([
                'shop_id' => $request->shop_id,
                'customer_id' => $request->customer_id,
                'total' => $totalAmount,
                'paid' => $amountPaid,
                'credit' => $credit,
                'payment_status' => $paymentStatus,
                'note' => $request->note,
                'owner_id' => $user->works_for,
                'sold_by' => $user->id,
                'sold_at' => now(),
            ]);
            
            // Process each item
            foreach ($items as $item) {
                $inventory = $item['inventory'];
                
                // Reduce inventory quantity
                $inventory->quantity -= $item['quantity'];
                $inventory->save();
                
                // Create sale item record
                $sale->items()->create([
                    'item_id' => $inventory->item_id,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['price'] * $item['quantity'],
                ]);
            }
            
            // If there's credit, create a credit record
            if ($credit > 0) {
                // Check if customer is specified for credit sale
                if (!$request->customer_id) {
                    throw new \Exception('Customer is required for credit sales');
                }
                
                CreditSale::create([
                    'sale_id' => $sale->id,
                    'customer_id' => $request->customer_id,
                    'amount' => $credit,
                    'remaining' => $credit,
                    'due_date' => now()->addDays(30), // Default 30 days credit period
                    'status' => 'pending',
                    'owner_id' => $user->works_for
                ]);
            }
            
            DB::commit();
            
            return redirect()->back()->with('message', 'Sale completed successfully');
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function creditPayed(Request $request, $id)
    {
        $user = auth()->user();
        $sale = Sale::findOrFail($id);
        
        // Ensure sale belongs to user's organization
        if ($sale->owner_id !== $user->works_for) {
            return redirect()->back()->with('error', 'Unauthorized');
        }
        
        $request->validate([
            'credit_payed' => 'required|numeric|gt:0|lte:' . $sale->credit,
            'note' => 'nullable|string',
        ]);
        
        // Update sale
        $sale->paid += $request->credit_payed;
        $sale->credit -= $request->credit_payed;
        
        // Update payment status
        if ($sale->credit <= 0) {
            $sale->payment_status = 'paid';
        }
        
        $sale->save();
        
        // Record credit payment
        $sale->creditHistory()->create([
            'amount' => $request->credit_payed,
            'approved_by' => $user->id,
            'note' => $request->note,
            'owner_id' => $user->works_for,
        ]);
        
        return redirect()->back()->with('message', 'Credit payment recorded successfully');
    }

    public function acceptCredit($id)
    {
        $user = auth()->user();
        
        $creditSale = CreditSale::with('sale')->findOrFail($id);
        
        // Ensure credit belongs to user's organization
        if ($creditSale->owner_id !== $user->works_for) {
            return redirect()->back()->with('error', 'Unauthorized');
        }
        
        $creditSale->status = 'approved';
        $creditSale->approved_by = $user->id;
        $creditSale->approved_at = now();
        $creditSale->save();
        
        return redirect()->back()->with('message', 'Credit approved successfully');
    }
} 