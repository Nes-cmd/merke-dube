<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\SubcategoryController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('stores', [StoreController::class, 'index']);
    Route::post('add-store', [StoreController::class, 'create']);
    Route::post('edit-store', [StoreController::class, 'edit']);
    Route::delete('delete-store', [StoreController::class, 'delete']);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('add-categories', [CategoryController::class, 'create']);
    Route::post('update-categories', [CategoryController::class, 'edit']);
    Route::delete('delete-categories', [CategoryController::class, 'delete']);

    Route::get('sub-categories', [SubcategoryController::class, 'index']);
    Route::post('add-sub-categories', [SubcategoryController::class, 'create']);
    Route::post('update-sub-categories', [SubcategoryController::class, 'edit']);
    Route::delete('delete-sub-categories', [SubcategoryController::class, 'delete']);

    Route::get('products', [ItemController::class, 'index']);
    Route::post('credit-payed', [ItemController::class, 'creditPayed']);
    Route::post('add-product', [ItemController::class, 'create']);
    Route::post('update-products', [ItemController::class, 'edit']);
    Route::delete('delete-products', [ItemController::class, 'delete']);

    Route::get('sales', [SaleController::class, 'index']);
    Route::post('add-sales', [SaleController::class, 'create']);
    Route::post('credit-received', [SaleController::class, 'cereditReceived']);
    Route::post('update-sales', [SaleController::class, 'edit']);
    Route::delete('delete', [SaleController::class, 'delete']);

    Route::post('register', [UserController::class, 'register']);
    Route::post('add-worker', [UserController::class, 'addWorker']);
    Route::delete('remove-worker', [UserController::class, 'removeWorker']);
});

