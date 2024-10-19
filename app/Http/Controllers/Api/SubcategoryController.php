<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ItemRequest;
use App\Http\Requests\SubCategoryRequest;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class SubcategoryController extends Controller
{
    public function index(Request $request){
        $categoryId = $request->categoryId;

        $suCategories = Subcategory::with('category')->whereHas('category', fn($query) => $query->where('owner_id', auth()->user()->works_for));
        if($categoryId){
            return $suCategories->where('category_id' , $categoryId)->get();
        }
        return  $suCategories->get();
    }

    public function create(SubCategoryRequest $request){
        return Subcategory::create([
            'name' => $request->name,
            'category_id' => $request->category_id,
        ]);
    }

    public function edit(){
        
    }

    public function delete($id) {
        return Subcategory::find($id)->delete();
    }

}
