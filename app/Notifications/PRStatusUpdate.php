<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PRStatusUpdate extends Notification
{
    use Queueable;

    public $pr;
    public $statusMessage;

    public function __construct($pr, $statusMessage)
    {
        $this->pr = $pr;
        $this->statusMessage = $statusMessage;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => '🛒 PR Update: ' . $this->pr->department . ' Dept',
            'user_email' => $this->statusMessage . ' (' . $this->pr->branch . ')',
            
            // 🟢 Send them straight to the Approval Board
            'action_url' => route('prpo.approval-board') 
        ];
    }
}