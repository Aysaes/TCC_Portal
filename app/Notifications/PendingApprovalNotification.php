<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PendingApprovalNotification extends Notification
{
    use Queueable;

    public $pr;
    public $message;

    public function __construct($pr, $message)
    {
        $this->pr = $pr;
        $this->message = $message;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        // 🟢 Force both to Integers so they are guaranteed to match
        $isRequester = (int) $notifiable->id === (int) $this->pr->user_id;

        $viewParam = $isRequester ? 'my_requests' : 'action_needed';

        return [
            'message' => '🛒 PR Update: ' . ($this->pr->department ?? 'Department'),
            'user_email' => $this->message,
            'action_url' => route('prpo.approval-board', ['view' => $viewParam]) 
        ];
    }
}