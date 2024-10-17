<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\ItemRequest;
use App\Http\Requests\PayCreditRequest;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ItemController extends Controller
{
    public function index() {

        $user = auth()->user();
        return ItemResource::collection(Item::all());
        return ItemResource::collection(Item::where('owner_id', $user->works_for)->get());
    }

    public function create(ItemRequest $request){
        $data = $request->validated();
        $data['owner_id'] = auth()->user()->works_for;
        $data['approved_by'] = auth()->id();

        return Item::create($data);
        
    }

    public function edit(){
        
    }

    public function delete() {
        
    }

    public function creditPayed(PayCreditRequest $request, $id) {
       
        $item = Item::find($id);
        $item->paid = $item->paid + $request->credit_payed;
        $item->credit = $item->credit - $request->credit_payed;
        if($item->credit == 0){
            $item->status = PaymentStatus::Completed;
        }

        $item->save();
        return $item;
    }
}