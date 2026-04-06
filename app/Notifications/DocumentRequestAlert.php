<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DocumentRequestAlert extends Notification
{
    use Queueable;

    public $hrRequest;
    public $requesterName;

    public function __construct($hrRequest, $requesterName)
    {
        $this->hrRequest = $hrRequest;
        $this->requesterName = $requesterName;
    }

    // 🟢 Strictly In-App Notification
    public function via($notifiable)
    {
        return ['database'];
    }

    // 🟢 What shows up in the React Bell Icon
    public function toArray($notifiable)
    {
        return [
            'message' => '📄 New ' . $this->hrRequest->type . ' Request',
            'user_email' => 'Requested by ' . $this->requesterName,
            
            'action_url' => route('hr.admin.index') 
        ];
    }
}