<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardLoginController;

// Страница логина
Route::get('/login', [DashboardLoginController::class, 'showLogin'])->name('login');
Route::post('/login', [DashboardLoginController::class, 'login'])->name('login.submit');
Route::post('/logout', [DashboardLoginController::class, 'logout'])->name('logout');

// Главная страница — только после авторизации
Route::get('/', function () {
    return view('app');
})->middleware('dashboard.auth')->name('home');
