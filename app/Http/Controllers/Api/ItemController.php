<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ItemResource;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index() {

        $user = auth()->user();
        return ItemResource::collection(Item::all());
        return ItemResource::collection(Item::where('owner_id', $user->works_for)->get());
    }

    public function create(){

    }

    public function edit(){
        
    }

    public function delete() {
        
    }

    public function creditPayed() {
        
    }
}