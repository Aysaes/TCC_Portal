<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DocumentStatusUpdate extends Notification
{
    use Queueable;

    public $hrRequest;
    public $statusMessage;

    public function __construct($hrRequest, $statusMessage)
    {
        $this->hrRequest = $hrRequest;
        $this->statusMessage = $statusMessage;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => 'Request Update: ' . $this->hrRequest->type,
            'user_email' => 'Status: ' . $this->statusMessage,
            
            // 🟢 Change this to the route where standard staff view their requests
            'action_url' => route('hr.index') 
        ];
    }
}