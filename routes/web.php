<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

// Route::redirect('/admin/login', 'login');
Route::middleware('guest')->get('login', [AuthController::class, 'redirect'])->name('login');
Route::get('auth/callback', [AuthController::class, 'callback']);
Route::middleware('auth')->post('/admin/logout', [AuthController::class, 'logout'])->name('filament.admin.auth.logout');
Route::redirect('/', 'login');
