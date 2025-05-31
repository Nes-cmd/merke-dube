<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\UserController;

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
    Route::post('/products/store', [App\Http\Controllers\ProductController::class, 'store'])
        ->name('products.store')
        ->middleware('web');
    Route::get('/products/{id}', [App\Http\Controllers\ProductController::class, 'show'])->name('products.show');
    Route::post('/products/{id}/credit-payed', [App\Http\Controllers\ProductController::class, 'creditPayed'])->name('products.credit-payed');
    Route::get('/products/{id}/refill', [App\Http\Controllers\ProductController::class, 'refill'])->name('products.refill');
    Route::post('/products/{id}/refill', [App\Http\Controllers\ProductController::class, 'storeRefill'])->name('products.store-refill');
    Route::post('/products/{id}/images', [App\Http\Controllers\ProductController::class, 'uploadImages'])->name('products.upload-images');
    Route::delete('/products/{id}/images/{imageId}', [App\Http\Controllers\ProductController::class, 'deleteImage'])->name('products.delete-image');
    Route::post('/products/{id}/images/order', [App\Http\Controllers\ProductController::class, 'updateImageOrder'])->name('products.update-image-order');
    Route::post('/products/{id}/images/{imageId}/primary', [App\Http\Controllers\ProductController::class, 'setPrimaryImage'])->name('products.set-primary-image');
    Route::get('/products/{id}/edit', [App\Http\Controllers\ProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{id}', [App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
    
    // Sales routes
    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('/sales/{id}', [SaleController::class, 'show'])->name('sales.show');
    Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
    Route::post('/sales/{id}/credit-payed', [SaleController::class, 'creditPayed'])->name('sales.credit-payed');
    Route::post('/sales/credit/{id}/accept', [SaleController::class, 'acceptCredit'])->name('sales.accept-credit');
    Route::get('/sales/shop-inventory/{shopId}', [SaleController::class, 'getShopInventory'])->name('sales.shop-inventory');
    
    // Warehouse routes
    Route::get('/warehouses', [App\Http\Controllers\WarehouseController::class, 'index'])->name('warehouses.index');
    Route::post('/warehouses', [App\Http\Controllers\WarehouseController::class, 'store'])->name('warehouses.store');
    Route::delete('/warehouses/{id}', [App\Http\Controllers\WarehouseController::class, 'destroy'])->name('warehouses.destroy');
    
    // Settings routes
    Route::get('/settings', [App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/workers', [App\Http\Controllers\UserController::class, 'addWorker'])->name('settings.add-worker');
    Route::delete('/settings/workers/{id}', [App\Http\Controllers\SettingsController::class, 'removeWorker'])->name('settings.remove-worker');
    Route::post('/settings/language', [App\Http\Controllers\SettingsController::class, 'updateLanguage'])->name('settings.update-language');
    Route::post('/settings/categories', [App\Http\Controllers\SettingsController::class, 'addCategory'])->name('settings.add-category');
    Route::delete('/settings/categories/{id}', [App\Http\Controllers\SettingsController::class, 'deleteCategory'])->name('settings.delete-category');
    Route::post('/settings/shops', [App\Http\Controllers\SettingsController::class, 'addShop'])->name('settings.add-shop');
    Route::delete('/settings/shops/{id}', [App\Http\Controllers\SettingsController::class, 'deleteShop'])->name('settings.delete-shop');
});

// Language switch route
Route::get('/language/{locale}', [App\Http\Controllers\LanguageController::class, 'switch'])
    ->name('language.switch');


Route::get('/auth/callback', [AuthController::class, 'callback']);
Route::middleware('guest')->get('auth/login', [AuthController::class, 'redirect'])->name('login');
Route::middleware('auth')->post('/logout', [AuthController::class, 'logout'])->name('logout');

// Shop routes
Route::get('/shops', [App\Http\Controllers\ShopController::class, 'index'])->name('shops.index');
Route::get('/shops/{id}', [App\Http\Controllers\ShopController::class, 'show'])->name('shops.show');
Route::post('/shops', [App\Http\Controllers\ShopController::class, 'store'])->name('shops.store');
Route::delete('/shops/{id}', [App\Http\Controllers\ShopController::class, 'destroy'])->name('shops.destroy');
Route::post('/shops/{id}/inventory', [App\Http\Controllers\ShopController::class, 'addInventory'])->name('shops.inventory.add');
Route::delete('/shops/{shopId}/inventory/{inventoryId}', [App\Http\Controllers\ShopController::class, 'removeInventory'])->name('shops.inventory.remove');

// Customer routes
Route::get('/customers', [App\Http\Controllers\CustomerController::class, 'index'])->name('customers.index');
Route::get('/customers/{id}', [App\Http\Controllers\CustomerController::class, 'show'])->name('customers.show');
Route::post('/customers', [App\Http\Controllers\CustomerController::class, 'store'])->name('customers.store');
Route::put('/customers/{id}', [App\Http\Controllers\CustomerController::class, 'update'])->name('customers.update');
Route::delete('/customers/{id}', [App\Http\Controllers\CustomerController::class, 'destroy'])->name('customers.destroy');

// Inventory routes
Route::get('/inventory', [InventoryController::class, 'index'])->name('inventory.index');
Route::get('/inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
Route::post('/inventory', [InventoryController::class, 'store'])->name('inventory.store');
Route::get('/inventory/{id}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');
Route::post('/inventory/{id}', [InventoryController::class, 'update'])->name('inventory.update');
Route::post('/inventory/{id}/refill', [InventoryController::class, 'refill'])->name('inventory.refill');
Route::delete('/inventory/{id}', [InventoryController::class, 'destroy'])->name('inventory.destroy');


