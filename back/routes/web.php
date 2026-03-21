<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/deploy-migrate', function () {
    Artisan::call('migrate --force');
    Artisan::call('db:seed');
    return "Tablas creadas y seeders ejecutados con éxito: " . Artisan::output();
});