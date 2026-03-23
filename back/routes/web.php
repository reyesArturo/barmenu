<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth', 'role:admin'])->get('/deploy-migrate', function () {
    Artisan::call('migrate --force');
    Artisan::call('db:seed --force');
    return "Tablas creadas y seeders ejecutados con exito: " . Artisan::output();
});
