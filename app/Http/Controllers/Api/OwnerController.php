<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Illuminate\Http\Request;

class OwnerController extends Controller
{
    public function owner(){
        return Owner::all();
    }

    public function create(){

    }

    public function edit(){
        
    }

    public function delete() {
        
    }
}
