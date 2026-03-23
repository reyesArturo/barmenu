<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/deploy-migrate', function () {
    Artisan::call('migrate --force');
    Artisan::call('db:seed --force');
    return "Tablas creadas y seeders ejecutados con exito: " . Artisan::output();
});

Route::get('/deploy-storage-link', function () {
    Artisan::call('storage:link');

    return "Storage link ejecutado: " . Artisan::output();
});


