<?php

use App\Models\CompanyContent;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\CompanyContentController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [

    ]);
});

// Keep this protective wrapper exactly as it is!
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Your main dashboard route stays the same
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // ONLY change the inside of the mission-vision route:
    Route::get('/dashboard/mission-vision', function () {
        
        // Grab the data (Make sure you added 'use App\Models\CompanyContent;' at the top of the file!)
        $contents = App\Models\CompanyContent::all();

        // Pass it to React
        return Inertia::render('MissionVision', [
            'contents' => $contents
        ]);

    })->name('dashboard.mission-vision');

});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin')->group(function(){

    Route::get('/dashboard', function(){
        return Inertia::render('Admin/AdminDashboard');
    })->name('.dashboard');

    // Employee Management

    Route::get('/employees', [EmployeeController::class, 'index'])->name('.employees');
    Route::post('/positions', [EmployeeController::class, 'storePosition'])->name('.positions.store');
    Route::post('/branches', [EmployeeController::class, 'storeBranch'])->name('.branches.store');
    Route::post('/users', [EmployeeController::class, 'storeUser'])->name('.users.store');
    Route::put('/users/{user}', [EmployeeController::class, 'updateUser'])->name('.users.update');
    Route::patch('/users/{user}/reset-device', [EmployeeController::class, 'resetDevice'])->name('.users.reset-device');
    Route::delete('/users/{user}', [EmployeeController::class, 'destroy'])->name('.users.destroy');

    // --- Company Content Management ---
    Route::get('/company-content', [CompanyContentController::class, 'index'])->name('.company-content.index');
    Route::post('/company-content', [CompanyContentController::class, 'store'])->name('.company-content.store');
    Route::put('/company-content/{companyContent}', [CompanyContentController::class, 'update'])->name('.company-content.update');
    Route::delete('/company-content/{companyContent}', [CompanyContentController::class, 'destroy'])->name('.company-content.destroy');
    Route::post('/company-content/type', [CompanyContentController::class, 'storeType'])->name('.company-content.type.store');

    // --- Announcements & Notices ---
    Route::get('/announcements', [\App\Http\Controllers\Admin\AnnouncementController::class, 'index'])->name('.announcements.index');
    Route::post('/announcements', [\App\Http\Controllers\Admin\AnnouncementController::class, 'store'])->name('.announcements.store');
    Route::put('/announcements/{announcement}', [\App\Http\Controllers\Admin\AnnouncementController::class, 'update'])->name('.announcements.update');
    Route::delete('/announcements/{announcement}', [\App\Http\Controllers\Admin\AnnouncementController::class, 'destroy'])->name('.announcements.destroy');
    Route::post('/announcements/priority', [\App\Http\Controllers\Admin\AnnouncementController::class, 'storePriority'])->name('.announcements.priority.store');
});

require __DIR__.'/auth.php';
