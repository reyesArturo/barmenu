<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\TableController;

/*
|--------------------------------------------------------------------------
| Rutas del Cliente (Móvil)
|--------------------------------------------------------------------------
*/
Route::prefix('client')->group(function () {
    Route::get('/menu', [ProductController::class, 'menu']); // Retorna categorías con productos
    Route::get('/table/{qr_token}', [OrderController::class, 'validateTable']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']); // Para tracking del estado
});

/*
|--------------------------------------------------------------------------
| Rutas Administrativas (Cocina / Dueño) - Protegidas por Sanctum
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas para la cocina
    Route::middleware('permission:orders.kitchen.view')->group(function () {
        Route::get('/kitchen/orders', [OrderController::class, 'kitchenOrders']);
        Route::get('/kitchen/history', [OrderController::class, 'kitchenHistory']);
    });

    Route::put('/kitchen/orders/{id}/status', [OrderController::class, 'updateStatus'])
        ->middleware('permission:orders.status.update');

    // Métricas para el dueño
    Route::get('/metrics', [OrderController::class, 'metrics'])
        ->middleware('permission:metrics.view');

    // Rutas para la caja (cobro)
    Route::middleware('permission:orders.cashier.view')->group(function () {
        Route::get('/cashier/orders', [OrderController::class, 'cashierOrders']);
        Route::get('/cashier/history', [OrderController::class, 'cashierHistory']);
    });

    Route::put('/cashier/orders/{id}/pay', [OrderController::class, 'markAsPaid'])
        ->middleware('permission:orders.cashier.pay');
    
    // Rutas para los QRs (Mesas)
    Route::get('/tables', [TableController::class, 'index'])->middleware('permission:tables.view');

    Route::middleware('permission:tables.manage')->group(function () {
        Route::post('/tables/generate', [TableController::class, 'generate']);
        Route::post('/tables/reset', [TableController::class, 'reset']);
    });

    // CRUD para administrar menú
    Route::middleware('permission:menu.manage')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('products', ProductController::class);
    });
});
