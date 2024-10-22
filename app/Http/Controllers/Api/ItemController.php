<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ItemRequest;
use App\Http\Requests\PayCreditRequest;
use App\Http\Resources\ItemResource;
use App\Models\CreditHistory;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{
    public function index() {

        $user = auth()->user();
        // return ItemResource::collection(Item::all());
        return ItemResource::collection(Item::where('owner_id', $user->works_for)->get());
    }

    public function itemCreditHistory($itemId) {
        $user = auth()->user();
        $history = CreditHistory::with('approver')->where('creditable_type', Item::class)->where('creditable_id', $itemId);
        if($user->is_owner){
            return $history->get();
        }
        return $history->where('approver_id', $user->id)->get();
    }

    public function create(ItemRequest $request){
        $data = $request->validated();
        $data['owner_id'] = auth()->user()->works_for;
        $data['approved_by'] = auth()->id();

        
        return new ItemResource(Item::create($data));
        
    }

    public function edit(){
        
    }

    public function delete($id) {
        return Item::findOrFail($id)->delete();
    }

    public function creditPayed(PayCreditRequest $request, $id) {
       
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


        return $item;
    }
}