<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DutyMeal;
use App\Models\DutyMealParticipant;
use App\Models\Branch;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DutyMealController extends Controller
{
    // 1. THE DASHBOARD: Shows the list of existing schedules
    public function index()
    {
        $dutymeals = DutyMeal::with('branch', 'participants.user:id,name')
            ->withCount('participants')
            ->latest('duty_date')
            ->get();

        return Inertia::render('DutyMeal/Index', [
            'dutymeals' => $dutymeals,
        ]);
    }

    public function create()
    {
       
        $employees = User::with('branches') 
            ->select('id', 'name', 'department_id', 'branch_id')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
              
                $user->assigned_branch_ids = $user->branches->pluck('id')->toArray();
                
                
                unset($user->branches); 
                
                return $user;
            });

        $branches = Branch::select('id', 'name')->get();
        $departments = Department::select('id', 'name')->get();

        return Inertia::render('DutyMeal/Create', [
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
        ]);
    }

    // 3. THE SAVER: Saves the submitted form to the database
    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'duty_date' => 'required|date',
            'main_meal' => 'required|string|max:255',
            'alt_meal' => 'nullable|string|max:255',
            'participants' => 'required|array|min:1',
            'participants.*.id' => 'required|exists:users,id',
            'participants.*.is_graveyard'=> 'required|boolean',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                $dutyMeal = DutyMeal::create([
                    'branch_id' => $validated['branch_id'],
                    'duty_date' => $validated['duty_date'],
                    'main_meal' => $validated['main_meal'],
                    'alt_meal' => $validated['alt_meal'],
                    'is_locked' => false,
                ]);

                $participantsData = collect($validated['participants'])->map(function ($staff) use ($dutyMeal) {
                    return [
                        'duty_meal_id' => $dutyMeal->id,
                        'user_id' => $staff['id'],
                        'choice' => 'none',
                        'is_graveyard' => $staff['is_graveyard'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                })->toArray();

                DutyMealParticipant::insert($participantsData);
            });

            return redirect()->route('admin.duty-meals.index')->with('success', 'Duty roster created successfully!');

        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return back()->with('error', 'A duty meal schedule already exists for this branch on this date.');
            }
            return back()->withErrors(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

   
    public function defaultParticipantToMain($id)
    {
        $participant = DutyMealParticipant::findOrFail($id);

        if ($participant->choice !== 'none') {
           return back()->with('error', 'Staff member has already selected a meal.');
        }

        $participant->update(['choice' => 'main']);
        return back()->with('success', 'Meal choice forced to Main.');
    }


    public function toggleParticipantDelivery($id)
    {
        $participant = DutyMealParticipant::findOrFail($id);
        $participant->update(['is_delivered' => !$participant->is_delivered]);

        $status = $participant->is_delivered ? 'Delivered' : 'Not Delivered';
        return back()->with('success', "Meal marked as {$status}.");
    }


    public function removeParticipant($id)
    {
        DutyMealParticipant::findOrFail($id)->delete();
        return back()->with('success', 'Staff member removed from roster.');
    }
}