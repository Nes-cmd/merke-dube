<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
    public function index(){
        return Subcategory::with('category')->get();
    }

    public function create(){

    }

    public function edit(){
        
    }

    public function delete() {
        
    }

}
