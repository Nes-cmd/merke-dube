<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Http\Requests\PayCreditRequest;
use App\Models\CreditHistory;
use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $products = Item::where('owner_id', $user->works_for)->get();
        
        return Inertia::render('Products', [
            'products' => $products
        ]);
    }
    
    public function show($id)
    {
        $product = Item::findOrFail($id);
        
        return Inertia::render('ProductDetail', [
            'product' => $product
        ]);
    }
    
    public function create()
    {
        return Inertia::render('ProductCreate');
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
} 