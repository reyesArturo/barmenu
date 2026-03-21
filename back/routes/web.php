<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/deploy-migrate', function () {
    Artisan::call('migrate --force');
    return "Tablas creadas con éxito: " . Artisan::output();
});