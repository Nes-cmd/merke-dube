<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\StoreResource;
use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index()  {
        return StoreResource::collection(Store::all());
    }

    public function create(){

    }

    public function edit(){
        
    }

    public function delete() {
        
    }
}
