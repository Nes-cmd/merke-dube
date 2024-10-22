<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreditRequest;
use App\Http\Requests\SaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\CreditHistory;
use App\Models\Sale;

class SaleController extends Controller
{
    public function index()  {
        $sales = Sale::with('item', 'approvedBy')->where('owner_id', auth()->user()->works_for)->get();
        return SaleResource::collection($sales);
    }
    public function saleCreditHistory($saleId) {
        $user = auth()->user();
        $history = CreditHistory::with('approver')->where('creditable_type', Sale::class)->where('creditable_id', $saleId);
        if($user->is_owner){
            return $history->get();
        }
        return $history->where('approver_id', $user->id)->get();
    }

    public function create(SaleRequest $request){
        $data = $request->validated();
        $data['owner_id'] = auth()->user()->works_for;
        $data['approved_by'] = auth()->id();
        $data['sold_at'] = now();

        $sale = Sale::create($data);
        
        $sale = Sale::with('item')->find($sale->id);

        $item = $sale->item;
        $item->quantity = $item->quantity - $sale->quantity_sold;
        $item->save();

        return $sale;
    }

    public function edit(){
        
    }

    public function delete($id) {
        return Sale::find($id)->delete();
    }

    public function cereditReceived(CreditRequest $request, $id) {
        $sale = Sale::with('item')->find($id);
        $sale->received_price = $sale->received_price + $request->credit_received;
        $sale->credit = $sale->credit - $request->credit_received;
        if($sale->credit == 0){
            $sale->payment_status = PaymentStatus::Completed;
        }
        $sale->save();

        CreditHistory::create([
            'creditable_type' => Sale::class,
            'creditable_id' => $sale->id,
            'value' => $request->credit_received,
            'approver_id' => auth()->id(),
            'note' => $request->note,
            'owner_id' => $sale->owner_id,
        ]);

        return $sale;
    }
}
