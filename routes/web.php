<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->get('login', [AuthController::class, 'redirect'])->name('login');
Route::get('auth/callback', [AuthController::class, 'callback']);


// 1000527833117 rabia kedr 