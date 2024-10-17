<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ItemRequest;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
    public function index(Request $request){
        $categoryId = $request->categoryId;
        return Subcategory::with('category')->where('category_id' , $categoryId)->get();
    }

    public function create(){


    }

    public function edit(){
        
    }

    public function delete() {
        
    }

}
