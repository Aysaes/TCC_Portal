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
use App\Http\Controllers\Admin\OrgChartController;
use App\Http\Controllers\HrRequestController;
use App\Http\Controllers\HR\ManpowerRequestController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', []);
});

    // Keep this protective wrapper exactly as it is!
        Route::middleware(['auth', 'verified'])->group(function () {
        
        // --- HR MODULE (User Requests) ---
        Route::get('/hr-module', [HrRequestController::class, 'index'])->name('hr.index');
        Route::post('/hr-module/request', [HrRequestController::class, 'store'])->name('hr.store');
        
        // --- HR MODULE (Admin Management) --- Add these two lines!
        Route::get('/hr-module/admin', [HrRequestController::class, 'adminIndex'])->name('hr.admin.index');
        Route::patch('/hr-module/admin/{hrRequest}/status', [HrRequestController::class, 'updateStatus'])->name('hr.admin.update-status');
    
        // --- OVERVIEW: Now the main landing page! ---
        Route::get('/dashboard', function () {
        $announcements = Announcement::with(['priorityLevel', 'branches'])
                            ->latest()
                            ->get();

        $contents = CompanyContent::all();

        return Inertia::render('Overview', [
            'announcements' => $announcements,
            'contents' => $contents
        ]);
    })->name('dashboard'); 

    // --- ANNOUNCEMENTS ---
    Route::get('/dashboard/announcements', function () {
        $announcements = Announcement::with(['priorityLevel', 'branches'])
                            ->latest()
                            ->get();

        return Inertia::render('Dashboard', [
            'announcements' => $announcements
        ]);
    })->name('dashboard.announcements');

    // --- MISSION & VISION ---
    Route::get('/dashboard/mission-vision', function () {
        $contents = CompanyContent::all();

        return Inertia::render('MissionVision', [
            'contents' => $contents
        ]);
    })->name('dashboard.mission-vision');

    // --- ORGANIZATIONAL CHART (USER VIEW) ---
    Route::get('/dashboard/org-chart', [OrgChartController::class, 'userIndex'])->name('dashboard.org-chart');

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
    Route::patch('/staff/duty-meals/{id}/lock-in', [\App\Http\Controllers\Staff\DutyMealController::class, 'lockIn'])->name('staff.duty-meals.lock-in');
});

    Route::middleware(['auth', AdminMiddleware::class])->prefix('admin')->name('admin')->group(function(){

    Route::get('/dashboard', function(){
        return Inertia::render('Admin/AdminDashboard');
    })->name('.dashboard');

    // Employee Management
    Route::get('/employees', [EmployeeController::class, 'index'])->name('.employees');
    Route::post('/positions', [EmployeeController::class, 'storePosition'])->name('.positions.store');
    Route::post('/branches', [EmployeeController::class, 'storeBranch'])->name('.branches.store');
    Route::post('/departments', [EmployeeController::class, 'storeDepartment'])->name('.departments.store');
    Route::post('/roles', [EmployeeController::class, 'storeRole'])->name('.roles.store');
    Route::post('/users', [EmployeeController::class, 'storeUser'])->name('.users.store');
    Route::put('/users/{user}', [EmployeeController::class, 'updateUser'])->name('.users.update');
    Route::patch('/users/{user}/reset-device', [EmployeeController::class, 'resetDevice'])->name('.users.reset-device');
    Route::delete('/users/{user}', [EmployeeController::class, 'destroy'])->name('.users.destroy');
    Route::delete('/departments/{department}', [EmployeeController::class, 'destroyDepartment'])->name('.departments.destroy');
    Route::delete('/roles/{role}', [EmployeeController::class, 'destroyRole'])->name('.roles.destroy');
    


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

    // --- Organizational Chart Management ---
    Route::get('/org-chart', [OrgChartController::class, 'index'])->name('.org-chart.index');
    Route::post('/org-chart', [OrgChartController::class, 'store'])->name('.org-chart.store');
    Route::put('/org-chart/{member}', [OrgChartController::class, 'update'])->name('.org-chart.update');
    Route::post('/org-chart/reorder', [OrgChartController::class, 'reorder'])->name('.org-chart.reorder'); 
    Route::delete('/org-chart/{member}', [OrgChartController::class, 'destroy'])->name('.org-chart.destroy');

    // Document Repository Routes
    Route::post('/documents', [DocumentController::class, 'store'])->name('.documents.store');
    Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('.documents.destroy');
    Route::post('/documents/category', [DocumentController::class, 'storeCategory'])->name('.documents.category.store');
    Route::delete('/documents/category/{id}', [DocumentController::class, 'destroyCategory'])->name('.documents.category.destroy');
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

Route::middleware(['auth'])->group(function(){
    // --- HR Feedback Form ---
    Route::get('/hr/feedback', [\App\Http\Controllers\HR\FeedbackController::class, 'create'])->name('hr.feedback.create');
    Route::post('/hr/feedback', [\App\Http\Controllers\HR\FeedbackController::class, 'store'])->name('hr.feedback.store');

    Route::prefix('hr')->name('hr.')->group(function(){

        Route::middleware(['role:admin,HR'])->group(function () {
            Route::get('/feedback-submissions', [\App\Http\Controllers\HR\FeedbackController::class, 'index'])->name('feedback.index');
        });

        Route::middleware(['role:admin,HR,Team Leader,Chief Vet,Operations Manager,TL'])->group(function(){
            Route::get('/manpower-requests/create', [ManpowerRequestController::class, 'create'])->name('manpower-requests.create');
            Route::post('/manpower-requests', [ManpowerRequestController::class, 'store'])->name('manpower-requests.store');
        });

        
        Route::middleware(['role:admin,HR,Director of Corporate Services and Operations,Chief Vet,Operations Manager,TL'])->group(function () {
            Route::get('/manpower-requests', [ManpowerRequestController::class, 'index'])->name('manpower-requests.index');
            Route::patch('/manpower-requests/{manpowerRequest}/status', [ManpowerRequestController::class, 'updateStatus'])->name('manpower-requests.update-status');
        });

    });

});

require __DIR__.'/auth.php';