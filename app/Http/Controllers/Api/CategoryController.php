<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()  {
        return Category::all();
    }

    
    public function create(){

    }

    public function edit(){
        
    }

    public function delete() {
        
    }
}