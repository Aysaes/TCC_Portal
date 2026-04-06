<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class DutyMealRosterCreated extends Notification
{
    use Queueable;

    public $dutyMeal;

    public function __construct($dutyMeal)
    {
        $this->dutyMeal = $dutyMeal;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        $date = Carbon::parse($this->dutyMeal->duty_date)->format('M d, Y');
        
        return [
            'message' => '🍽️ New Duty Meal Roster',
            'user_email' => 'You have been scheduled for a duty meal on ' . $date . '.',
            
            // 🟢 Directs the employee to their duty meal page to make a choice
            'action_url' => route('staff.duty-meals.index') 
        ];
    }
}