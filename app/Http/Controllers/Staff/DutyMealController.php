<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\DutyMealParticipant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DutyMealController extends Controller
{

    public function index(Request $request)
    {

        $myDutyMeals = DutyMealParticipant::with('dutyMeal.branch')
            ->where('user_id', $request->user()->id)
            ->get()

            ->map(function ($participant) {
                return [
                    'participant_id' => $participant->id,
                    'choice' => $participant->choice,
                    'is_delivered' => $participant->is_delivered,
                    'duty_date' => $participant->dutyMeal->duty_date,
                    'main_meal' => $participant->dutyMeal->main_meal,
                    'alt_meal' => $participant->dutyMeal->alt_meal,
                    'is_locked' => $participant->dutyMeal->is_locked,
                    'branch_name' => $participant->dutyMeal->branch->name ?? 'Unknown',
                ];
            })

            ->sortByDesc('duty_date')
            ->values();

        return Inertia::render('Staff/Duty Meals/Index', [
            'myDutyMeals' => $myDutyMeals,
        ]);
    }


    public function updateChoice(Request $request, $participantId)
    {
        $request->validate(['choice' => 'required|in:main,alt']);


        $participant = DutyMealParticipant::where('id', $participantId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();


        if ($participant->dutyMeal->is_locked) {
            return back()->withErrors(['error' => 'This roster is locked by the admin.']);
        }

        $participant->update(['choice' => $request->choice]);

        return back();
    }
}