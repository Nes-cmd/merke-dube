<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()  {
        return Category::all();
    }

    
    public function create(CategoryRequest $request){
        return Category::create([
            'name' => $request->name,
            'owner_id' => auth()->user()->works_for,
            'description' => $request->description,
        ]);
    }

    public function edit(){
        
    }

    public function delete($id) {
        return Category::find($id)->delete();
    }
}