<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ManpowerStatusAlert extends Notification
{
    use Queueable;

    public $manpowerRequest;
    public $statusMessage;

    // We pass the request and a custom message (e.g., "Approved", "Rejected", "Endorsed")
    public function __construct($manpowerRequest, $statusMessage)
    {
        $this->manpowerRequest = $manpowerRequest;
        $this->statusMessage = $statusMessage;
    }

    // 🟢 In-app only!
    public function via($notifiable)
    {
        return ['database']; 
    }

    // 🟢 What shows up in the user's React Bell Icon
    public function toArray($notifiable)
    {
        $position = $this->manpowerRequest->position->name ?? 'a position';
        
        return [
            'message' => 'Request Update: ' . $position,
            'user_email' => 'Status: ' . $this->statusMessage,
            'action_url' => route('hr.manpower-requests.index') // Sends them to their dashboard
        ];
    }
}