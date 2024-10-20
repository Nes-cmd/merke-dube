<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequest;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index()  {
        $stores = Store::with('owner')->withCount('items')->where('owner_id', auth()->user()->works_for)->get();
        return StoreResource::collection($stores);
    }

    public function create(StoreRequest $request){

        return Store::create([
            'name' => $request->name,
            'location' => $request->location,
            'owner_id' => auth()->user()->works_for,
        ]);
    }

    public function edit(){
        
    }

    public function delete($id) {
        return Store::find($id)->delete();
    }
}
