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
            ->whereHas('dutyMeal', function ($query) {
                $query->whereDate('duty_date', '>=', now()->startOfWeek());
            })
            ->get() 
            ->map(function ($participant) {
                return [
                    'participant_id' => $participant->id,
                    'choice' => $participant->choice,
                    'custom_request' => $participant->custom_request,
                    'duty_date' => $participant->dutyMeal->duty_date,
                    'main_meal' => $participant->dutyMeal->main_meal,
                    'alt_meal' => $participant->dutyMeal->alt_meal,
                    'is_locked' => $participant->dutyMeal->is_locked,
                    'branch_name' => $participant->dutyMeal->branch->name ?? 'Unknown',
                ];
            })
            // 3. Sort the final collection
            ->sortByDesc('duty_date')
            ->values();

        return Inertia::render('Staff/Duty Meals/Index', [
            'myDutyMeals' => $myDutyMeals,
        ]);
    }


    public function updateChoice(Request $request, $participantId)
    {
        try{
            $request->validate([
            'choice' => 'required|in:main,alt',
            'custom_request' => 'nullable|string|max:255'
        ]);

        $participant = DutyMealParticipant::where('id', $participantId)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();


        if ($participant->dutyMeal->is_locked) {
            return back()->with('error', 'This roster is locked by the admin.');
        }

        if ($participant->choice !== 'none') {
            return back()->with('error', 'You have already selected your meal.');
        }

        $participant->update(['choice' => $request->choice, 'custom_request' => $request->custom_request]);

       return back()->with('success', 'Your meal choice has been successfully locked in!');

        }catch(\Exception $e){
             return back()->with('error', 'Failed to update choice: ' . $e->getMessage());
        }
    }
}