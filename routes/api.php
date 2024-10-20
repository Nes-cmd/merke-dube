<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ItemController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\SubcategoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);
Route::middleware('api')->post('auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function(){
    Route::get('stores', [StoreController::class, 'index']);
    Route::post('add-store', [StoreController::class, 'create']);
    Route::post('edit-store', [StoreController::class, 'edit']);
    Route::delete('delete-store/{id}', [StoreController::class, 'delete']);

    Route::get('categories', [CategoryController::class, 'index']);
    Route::post('add-categories', [CategoryController::class, 'create']);

    Route::post('update-categories', [CategoryController::class, 'edit']);
    Route::delete('delete-categories/{id}', [CategoryController::class, 'delete']);

    Route::get('sub-categories', [SubcategoryController::class, 'index']);
    Route::post('add-sub-categories', [SubcategoryController::class, 'create']);
    Route::post('update-sub-categories', [SubcategoryController::class, 'edit']);
    Route::delete('delete-sub-categories/{id}', [SubcategoryController::class, 'delete']);

    Route::get('products', [ItemController::class, 'index']);
    Route::post('product-credit-paid/{id}', [ItemController::class, 'creditPayed']);
    Route::post('add-product', [ItemController::class, 'create']);
    Route::post('update-products', [ItemController::class, 'edit']);
    Route::middleware(AdminMiddleware::class)->delete('delete-product/{id}', [ItemController::class, 'delete']);

    Route::get('sales', [SaleController::class, 'index']);
    Route::post('add-sales', [SaleController::class, 'create']);
    Route::post('credit-received/{id}', [SaleController::class, 'cereditReceived']);
    Route::post('update-sales', [SaleController::class, 'edit']);
    Route::delete('delete-sale/{id}', [SaleController::class, 'delete'])->middleware(AdminMiddleware::class);

    Route::post('register', [UserController::class, 'register']);

    Route::middleware(AdminMiddleware::class)->get('workers', [UserController::class, 'workers']);
    Route::middleware(AdminMiddleware::class)->post('add-worker', [UserController::class, 'addWorker']);
    Route::middleware(AdminMiddleware::class)->delete('remove-worker/{id}', [UserController::class, 'removeWorker']);
});

