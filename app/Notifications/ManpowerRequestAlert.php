<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ManpowerRequestAlert extends Notification
{
    use Queueable;

    public $manpowerRequest;
    public $requesterName;

    // Pass the created request and the user who made it
    public function __construct($manpowerRequest, $requesterName)
    {
        $this->manpowerRequest = $manpowerRequest;
        $this->requesterName = $requesterName;
    }

    // Tell Laravel to send this via database (for the bell icon) AND email
    public function via($notifiable)
    {
        return ['database'];
    }

    // 🟢 What shows up in the React Bell Icon Dropdown
    public function toArray($notifiable)
    {
        return [
            'message' => 'New Manpower Request from ' . $this->requesterName,
            'user_email' => $this->manpowerRequest->department->name . ' Department',
            // Changed to your actual index route
            'action_url' => route('hr.manpower-requests.index') 
        ];
    }
}