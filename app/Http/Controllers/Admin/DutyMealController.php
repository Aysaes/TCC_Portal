<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DutyMeal;
use App\Models\DutyMealParticipant;
use App\Models\Branch;
use App\Models\User;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Carbon\Carbon;
use App\Notifications\DutyMealRosterCreated;

class DutyMealController extends Controller
{
    
    public function index()
    {

        $today = now()->startOfDay();


        
        if (now()->format('H:i') >= '10:00') {
            $todayMealIds = DutyMeal::whereDate('duty_date', $today)->pluck('id');
            
            if ($todayMealIds->isNotEmpty()) {
                DutyMealParticipant::whereIn('duty_meal_id', $todayMealIds)
                    ->where('choice', 'none')
                    ->update(['choice' => 'main']);
            }
        }


        $pastMealIds = DutyMeal::whereDate('duty_date', '<', $today)->pluck('id');
        if ($pastMealIds->isNotEmpty()) {
            DutyMealParticipant::whereIn('duty_meal_id', $pastMealIds)
                ->where('choice', 'none')
                ->update(['choice' => 'main']);
        }

        $user = Auth::user();
        
       
        $allowedBranchIds = $user->branches->pluck('id')->push($user->branch_id)->filter()->unique();

        $dutymeals = DutyMeal::with([
            'branch', 
            'participants.user:id,name' 
        ])
        
        ->when($user->role_id !== 1, function ($query) use ($allowedBranchIds) {
            $query->whereIn('branch_id', $allowedBranchIds);
        })
        ->whereDate('duty_date', '>=', now()->startOfMonth())
        ->withCount('participants')
        ->latest('duty_date')
        ->get();

        $employees = User::with(['department:id,name', 'position:id,name'])
            ->select('id', 'name', 'department_id', 'position_id', 'branch_id')
            ->when($user->role_id !== 1, function ($query) use ($allowedBranchIds) {
                $query->where(function ($q) use ($allowedBranchIds) {
                    $q->whereIn('branch_id', $allowedBranchIds)
                      ->orWhereHas('branches', function ($pivotQuery) use ($allowedBranchIds) {
                          $pivotQuery->whereIn('branch_id', $allowedBranchIds);
                      });
                });
            })
            ->orderBy('name')
            ->get();

        $departments = Department::select('id', 'name')->orderBy('name')->get();
        $positions = Position::select('id', 'name', 'department_id')->orderBy('name')->get();

        $branches = Branch::select('id', 'name')
            ->when($user->role_id !== 1, function ($query) use ($allowedBranchIds) {
                $query->whereIn('id', $allowedBranchIds);
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('DutyMeal/Index', [
            'dutymeals' => $dutymeals,
            'employees' => $employees,
            'departments' => $departments,
            'positions' => $positions,
            'branches' => $branches,
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        $allowedBranchIds = $user->branches->pluck('id')->push($user->branch_id)->filter()->unique();

        
        $branches = Branch::select('id', 'name')
            ->when($user->role_id !== 1, function ($query) use ($allowedBranchIds) {
                $query->whereIn('id', $allowedBranchIds);
            })
            ->orderBy('name')
            ->get();

       
        $employees = User::with(['branches', 'department:id,name'])
            ->when($user->role_id !== 1, function ($query) use ($allowedBranchIds) {
                $query->where(function ($q) use ($allowedBranchIds) {
                    $q->whereIn('branch_id', $allowedBranchIds)
                      ->orWhereHas('branches', function ($pivotQuery) use ($allowedBranchIds) {
                          $pivotQuery->whereIn('branch_id', $allowedBranchIds);
                      });
                });
            })
            ->select('id', 'name', 'department_id', 'position_id','branch_id')
            ->orderBy('name')
            ->get()
            ->map(function ($emp) {
                $emp->assigned_branch_ids = $emp->branches->pluck('id')->toArray();
                unset($emp->branches); 
                return $emp;
            });

        $departments = Department::select('id', 'name')->orderBy('name')->get();

        $positions = Position::select('id', 'name', 'department_id')->orderBy('name')->get();

        return Inertia::render('DutyMeal/Create', [
            'employees' => $employees,
            'branches' => $branches,
            'departments' => $departments,
            'positions' => $positions,
        ]);
    }

   // 3. THE SAVER: Saves the submitted weekly form to the databas
    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'week_start' => 'required|date',
            'schedule' => 'required|array|min:1',
            'schedule.*.date' => 'required|date',
            'schedule.*.main_meal' => 'nullable|string|max:255',
            'schedule.*.alt_meal' => 'nullable|string|max:255',
            'schedule.*.participants' => 'nullable|array',
            'schedule.*.participants.*.id' => 'required_with:schedule.*.participants|exists:users,id',
            'schedule.*.participants.*.shift_type'=> 'required_with:schedule.*.participants|string|in:day,graveyard,straight',
        ]);

        try {
            $createdDutyMeals = collect();
            $allParticipantData = [];
            $userIdsToNotify = [];

            DB::transaction(function () use ($validated, &$createdDutyMeals, &$allParticipantData, &$userIdsToNotify) {
                // Loop through all 7 days submitted from React
                foreach ($validated['schedule'] as $day) {
                    
                    // 1. SMART SKIP: If this day has no meals typed AND no staff added, just skip it!
                    if (empty($day['main_meal']) && empty($day['participants'])) {
                        continue; 
                    }

                    // 2. Create the Duty Meal for this specific date
                    $dutyMeal = DutyMeal::create([
                        'branch_id' => $validated['branch_id'],
                        'duty_date' => $day['date'],
                        // If they added staff but forgot the meal, default to TBD so it doesn't crash
                        'main_meal' => $day['main_meal'] ?? 'TBD', 
                        'alt_meal' => $day['alt_meal'] ?? null,
                        'is_locked' => false,
                    ]);

                    $createdDutyMeals->push($dutyMeal);

                    // 3. Prepare the participants for this specific date
                    if (!empty($day['participants'])) {
                        foreach ($day['participants'] as $staff) {
                            $allParticipantData[] = [
                                'duty_meal_id' => $dutyMeal->id,
                                'user_id' => $staff['id'],
                                'choice' => 'none',
                                'shift_type' => $staff['shift_type'],
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                            
                            // Collect user ID for notifications
                            $userIdsToNotify[] = $staff['id'];
                        }
                    }
                }

                // 4. Perform a massive bulk insert for all staff across all days (Super fast!)
                if (!empty($allParticipantData)) {
                    DutyMealParticipant::insert($allParticipantData);
                }
            });

            // 🟢 NEW: Notify participants, but prevent spam!
            if (!empty($userIdsToNotify) && $createdDutyMeals->isNotEmpty()) {
                // array_unique ensures if John works Mon/Tue/Wed, he only gets 1 email, not 3.
                $uniqueUserIds = array_unique($userIdsToNotify);
                $employeesToNotify = User::whereIn('id', $uniqueUserIds)->get();
                
                // We use the very first created meal of the week as the reference for the notification
                $referenceMeal = $createdDutyMeals->first();

                if ($employeesToNotify->isNotEmpty()) {
                    Notification::send($employeesToNotify, new DutyMealRosterCreated($referenceMeal));
                }
            }

            return redirect()->route('admin.duty-meals.index')->with('success', 'Weekly duty roster published successfully!');

        } catch (\Illuminate\Database\QueryException $e) {
            // Error 1062 is a Duplicate Entry (meaning a roster already exists for that branch on that date)
            if ($e->errorInfo[1] == 1062) {
                return back()->with('error', 'A roster already exists for one of these dates! Please edit the existing roster instead.');
            }
            return back()->withErrors(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

   
   public function updateParticipantChoice(Request $request, $id)
    {
        $request->validate([
            'choice' => 'required|in:main,alt'
        ]);

        $participant = DutyMealParticipant::findOrFail($id);

        // Optional: If you only want to allow forcing a choice when they haven't picked yet, 
        // you can uncomment the following 3 lines. Otherwise, it overrides their current choice.
        // if ($participant->choice !== 'none') {
        //     return back()->with('error', 'Staff member has already selected a meal.');
        // }

        $participant->update(['choice' => $request->choice]);
        
        return back()->with('success', "Meal choice successfully set to {$request->choice}.");
    }


    public function removeParticipant($id)
    {
        $participant = DutyMealParticipant::findOrFail($id);

        $meal = DutyMeal::findOrFail($participant->duty_meal_id);

       
        if ($meal->is_locked) {
            return back()->with('error', 'This roster is locked and can no longer be edited.');
        }

        $participant->delete();

        return back()->with('success', 'Staff member removed from roster.');
    }

    public function addParticipant(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $meal = DutyMeal::findOrFail($id);

        if ($meal->is_locked) {
            return back()->with('error', 'This roster is locked and can no longer be edited.');
        }

        // Prevent adding them twice
        if ($meal->participants()->where('user_id', $request->user_id)->exists()) {
            return back()->with('error', 'Staff member is already on this roster.');
        }

        $meal->participants()->create([
            'user_id' => $request->user_id,
            'choice' => 'none', // Default to none so they can pick their own meal
            // UPDATED HERE: Default to 'day' shift instead of is_graveyard = false
            'shift_type' => 'day', 
            'custom_request' => null,
        ]);

        return back()->with('success', 'Staff member successfully added to the roster!');
    }

    public function updateParticipantShift(Request $request, $id)
    {
        $request->validate([
            'shift_type' => 'required|string|in:day,graveyard,straight'
        ]);

        $participant = DutyMealParticipant::findOrFail($id);
        
        // Ensure the meal isn't locked before making changes
        $meal = DutyMeal::findOrFail($participant->duty_meal_id);
        if ($meal->is_locked) {
            return back()->with('error', 'This roster is locked and cannot be edited.');
        }

        // Update the shift
        $participant->update([
            'shift_type' => $request->shift_type
        ]);
        
        return back()->with('success', 'Shift successfully updated.');
    }

    public function updateMeals(Request $request, $id)
    {
        $request->validate([
            'main_meal' => 'required|string|max:255',
            'alt_meal' => 'nullable|string|max:255',
        ]);

        $meal = DutyMeal::findOrFail($id);

        if ($meal->is_locked) {
            return back()->with('error', 'This roster is locked and cannot be edited.');
        }

        $meal->update([
            'main_meal' => $request->main_meal,
            'alt_meal' => $request->alt_meal,
        ]);

        return back()->with('success', 'Meal options successfully updated.');
    }

    public function archive(Request $request)
    {
        $user = Auth::user();
        $allowedBranchIds = $user->branches->pluck('id')->push($user->branch_id)->filter()->unique();

        // 1. Find all available archived months/years for the dropdown filter
        $availableDates = DutyMeal::whereDate('duty_date', '<', now()->startOfMonth())
            ->selectRaw('YEAR(duty_date) as year, MONTH(duty_date) as month')
            ->distinct()
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();


        $defaultYear = $availableDates->first()->year ?? now()->subMonth()->year;
        $defaultMonth = $availableDates->first()->month ?? now()->subMonth()->month;

        $filterYear = $request->input('year', $defaultYear);
        $filterMonth = $request->input('month', $defaultMonth);

      
        $archivedMeals = DutyMeal::with('branch')
            ->when($user->role_id !== 1, function ($query) use ($allowedBranchIds) {
                $query->whereIn('branch_id', $allowedBranchIds);
            })
            ->whereYear('duty_date', $filterYear)
            ->whereMonth('duty_date', $filterMonth)
            ->withCount('participants')
            ->orderBy('duty_date', 'asc')
            ->get()
 
            ->groupBy(function ($meal) {
                return 'Week ' . Carbon::parse($meal->duty_date)->weekOfMonth;
            });

        return Inertia::render('DutyMeal/Archive', [
            'archivedMealsByWeek' => $archivedMeals,
            'availableDates' => $availableDates,
            'currentFilter' => ['year' => $filterYear, 'month' => $filterMonth]
        ]);
    }


    public function destroy($id)
    {
        DutyMeal::findOrFail($id)->delete();
        return back()->with('success', 'Roster permanently deleted.');
    }


    public function bulkDelete(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        DutyMeal::whereIn('id', $request->ids)->delete();
        
        return back()->with('success', count($request->ids) . ' rosters permanently deleted.');
    }
}