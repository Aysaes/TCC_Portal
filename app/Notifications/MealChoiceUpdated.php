<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Carbon\Carbon;

class MealChoiceUpdated extends Notification
{
    use Queueable;

    public $participant;
    public $mealDate;

    public function __construct($participant)
    {
        $this->participant = $participant;
        $this->mealDate = Carbon::parse($participant->dutyMeal->duty_date)->format('M d');
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => '🍱 Meal Selected',
            'user_email' => $this->participant->user->name . ' picked ' . strtoupper($this->participant->choice) . ' for ' . $this->mealDate,
            
            'action_url' => route('admin.duty-meals.index') 
        ];
    }
}