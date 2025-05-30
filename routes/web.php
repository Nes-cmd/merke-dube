<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Products routes
    Route::get('/products', [App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [App\Http\Controllers\ProductController::class, 'create'])->name('products.create');
    Route::get('/products/{id}', [App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
    Route::post('/products/{id}/credit-payed', [App\Http\Controllers\ProductController::class, 'creditPayed'])->name('products.credit-payed');
    
    // Sales routes
    Route::get('/sales', [App\Http\Controllers\SaleController::class, 'index'])->name('sales.index');
    Route::get('/sales/create', [App\Http\Controllers\SaleController::class, 'create'])->name('sales.create');
    Route::get('/sales/{id}', [App\Http\Controllers\SaleController::class, 'show'])->name('sales.show');
    Route::post('/sales/{id}/credit-payed', [App\Http\Controllers\SaleController::class, 'creditPayed'])->name('sales.credit-payed');
    
    // Warehouse routes
    Route::get('/warehouses', [App\Http\Controllers\WarehouseController::class, 'index'])->name('warehouses.index');
    Route::post('/warehouses', [App\Http\Controllers\WarehouseController::class, 'store'])->name('warehouses.store');
    Route::delete('/warehouses/{id}', [App\Http\Controllers\WarehouseController::class, 'destroy'])->name('warehouses.destroy');
    
    // Settings routes
    Route::get('/settings', [App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/workers', [App\Http\Controllers\SettingsController::class, 'addWorker'])->name('settings.add-worker');
    Route::delete('/settings/workers/{id}', [App\Http\Controllers\SettingsController::class, 'removeWorker'])->name('settings.remove-worker');
    Route::post('/settings/language', [App\Http\Controllers\SettingsController::class, 'updateLanguage'])->name('settings.update-language');
});

// Language switch route
Route::get('/language/{locale}', [App\Http\Controllers\LanguageController::class, 'switch'])
    ->name('language.switch');


Route::get('/auth/callback', [AuthController::class, 'callback']);
Route::middleware('guest')->get('auth/login', [AuthController::class, 'redirect'])->name('login');
Route::middleware('auth')->post('/logout', [AuthController::class, 'logout'])->name('logout');


