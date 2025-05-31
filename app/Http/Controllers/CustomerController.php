<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $customers = Customer::where('owner_id', $user->works_for)
            ->withCount('sales')
            ->get();
        
        return Inertia::render('Customers', [
            'customers' => $customers
        ]);
    }
    
    public function show($id)
    {
        $user = auth()->user();
        $customer = Customer::with(['sales' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }])->findOrFail($id);
        
        // Ensure customer belongs to the user's owner
        if ($customer->owner_id !== $user->works_for) {
            return redirect()->route('customers.index')
                ->with('error', 'You do not have permission to view this customer');
        }
        
        return Inertia::render('CustomerDetail', [
            'customer' => $customer
        ]);
    }
    
    public function store(Request $request)
    {
        $user = auth()->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers,phone',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        
        Customer::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'notes' => $request->notes,
            'owner_id' => $user->works_for,
        ]);
        
        return redirect()->back()->with('message', 'Customer added successfully');
    }
    
    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $customer = Customer::findOrFail($id);
        
        // Ensure customer belongs to the user's owner
        if ($customer->owner_id !== $user->works_for) {
            return redirect()->route('customers.index')
                ->with('error', 'You do not have permission to update this customer');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20|unique:customers,phone,'.$id,
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        
        $customer->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'notes' => $request->notes,
        ]);
        
        return redirect()->back()->with('message', 'Customer updated successfully');
    }
    
    public function destroy($id)
    {
        $user = auth()->user();
        $customer = Customer::findOrFail($id);
        
        // Ensure customer belongs to the user's owner
        if ($customer->owner_id !== $user->works_for) {
            return redirect()->route('customers.index')
                ->with('error', 'You do not have permission to delete this customer');
        }
        
        // Check if customer has sales
        if ($customer->sales()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete customer with sales history');
        }
        
        $customer->delete();
        
        return redirect()->back()->with('message', 'Customer deleted successfully');
    }
} 