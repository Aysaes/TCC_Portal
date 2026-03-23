<?php

use App\Models\Announcement;
use App\Models\CompanyContent;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\EmployeeController;
use App\Http\Controllers\Admin\CompanyContentController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\CheckDutyMealAccess;
use App\Http\Controllers\Admin\DocumentController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\DutyMealController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [

    ]);
});

// Keep this protective wrapper exactly as it is!
Route::middleware(['auth', 'verified'])->group(function () {
    
    // --- OVERVIEW: Now the main landing page! ---
    Route::get('/dashboard', function () {
        // Grab the 6 most recent announcements for the overview
        $announcements = Announcement::with(['priorityLevel', 'branches'])
                            ->latest()
                            ->get();

        // Grab the Mission & Vision data
        $contents = CompanyContent::all();

        // Pass both to the Overview React component
        return Inertia::render('Overview', [
            'announcements' => $announcements,
            'contents' => $contents
        ]);
    })->name('dashboard'); // Keeps the default 'dashboard' name so logins redirect here

    // --- ANNOUNCEMENTS: Moved to its own specific route ---
    Route::get('/dashboard/announcements', function () {
        // Grab all announcements from the database, newest first
        $announcements = Announcement::with(['priorityLevel', 'branches'])
                            ->latest()
                            ->get();

        // Pass them to the React component
        return Inertia::render('Dashboard', [
            'announcements' => $announcements
        ]);
    })->name('dashboard.announcements');

    // ONLY change the inside of the mission-vision route:
    Route::get('/dashboard/mission-vision', function () {
        
        // Grab the data
        $contents = CompanyContent::all();

        // Pass it to React
        return Inertia::render('MissionVision', [
            'contents' => $contents
        ]);

    })->name('dashboard.mission-vision');

    Route::get('/admin/documents', [DocumentController::class, 'index'])->name('admin.documents.index');
    Route::get('/documents/{document}/view/{filename?}', [DocumentController::class, 'show'])->name('documents.show');
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Staff Duty Meal Routes
    Route::get('/my-duty-meals', [\App\Http\Controllers\Staff\DutyMealController::class, 'index'])->name('staff.duty-meals.index');
    Route::patch('/my-duty-meals/{participantId}/choice', [\App\Http\Controllers\Staff\DutyMealController::class, 'updateChoice'])->name('staff.duty-meals.choice');
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


// DUTY MEAL MODULE (Admins & Custodians)

Route::middleware(['auth', CheckDutyMealAccess::class])->group(function () {
    
    Route::get('/admin/duty-meals', [DutyMealController::class, 'index'])->name('admin.duty-meals.index');
    Route::get('/admin/duty-meals/create', [DutyMealController::class, 'create'])->name('admin.duty-meals.create');
    Route::post('/admin/duty-meals', [DutyMealController::class, 'store'])->name('admin.duty-meals.store');

    // Duty Meal Participant Actions
    Route::patch('/admin/duty-meals/participants/{id}/default-main', [DutyMealController::class, 'defaultParticipantToMain'])->name('admin.participants.default-main');
    Route::delete('/admin/duty-meals/participants/{id}', [DutyMealController::class, 'removeParticipant'])->name('admin.participants.remove');
    Route::post('/duty-meals/{id}/add-participant', [DutyMealController::class, 'addParticipant'])->name('admin.duty-meals.add-participant');

    //Duty Meal Archives
    Route::get('/duty-meals/archive', [DutyMealController::class, 'archive'])->name('admin.duty-meals.archive');
    Route::delete('/duty-meals/{id}', [DutyMealController::class, 'destroy'])->name('admin.duty-meals.destroy');
    Route::post('/duty-meals/bulk-delete', [DutyMealController::class, 'bulkDelete'])->name('admin.duty-meals.bulk-delete');
    
});

require __DIR__.'/auth.php';