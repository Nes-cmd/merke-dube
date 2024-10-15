<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function index()  {
        return SaleResource::collection(Sale::all());
    }

    public function create(){

    }

    public function edit(){
        
    }

    public function delete() {
        
    }

    public function cereditReceived() {
        
    }
}
