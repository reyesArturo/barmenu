<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;

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
Route::post('/login', [App\Http\Controllers\AuthController::class, 'login']);

Route::prefix('admin')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Rutas para la cocina
    Route::get('/kitchen/orders', [OrderController::class, 'kitchenOrders']);
    Route::put('/kitchen/orders/{id}/status', [OrderController::class, 'updateStatus']);

    // Métricas para el dueño
    Route::get('/metrics', [OrderController::class, 'metrics']);

    // Rutas para la caja (cobro)
    Route::get('/cashier/orders', [OrderController::class, 'cashierOrders']);
    
    // Rutas para los QRs (Mesas)
    Route::get('/tables', function () {
        return \App\Models\Table::all();
    });

    // CRUD para administrar menú
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('products', ProductController::class);
});
