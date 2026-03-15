<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [

    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin')->group(function(){

    Route::get('/dashboard', function(){
        return Inertia::render('Admin/AdminDashboard');
    })->name('.dashboard');

    Route::get('/employees', [EmployeeController::class, 'index'])->name('.employees');
});

require __DIR__.'/auth.php';
