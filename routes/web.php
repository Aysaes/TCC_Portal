<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\CompanyContentController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\AnnouncementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [

    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/dashboard/mission-vision', function () {
    return Inertia::render('MissionVision');
    })->name('dashboard.mission-vision');

       Route::get('/admin/documents', [DocumentController::class, 'index'])->name('admin.documents.index');
       Route::get('/documents/{document}/view', [DocumentController::class, 'show'])->name('documents.show');
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
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('.announcements.index');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('.announcements.store');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('.announcements.update');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('.announcements.destroy');
    Route::post('/announcements/priority', [AnnouncementController::class, 'storePriority'])->name('.announcements.priority.store');

    // Document Repository Routes
    Route::post('/documents', [DocumentController::class, 'store'])->name('.documents.store');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('.documents.destroy');
    Route::post('/documents/category', [DocumentController::class, 'storeCategory'])->name('.documents.category.store');
});

require __DIR__.'/auth.php';
