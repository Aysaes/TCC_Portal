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
        // 🟢 Safely check the receiving user's role
        $userRole = strtolower(trim($notifiable->role->name ?? ''));
        $allowedRoles = ['procurement assist', 'procurement tl', 'director of corporate services and operations', 'admin', 'operations manager', 'inventory assist', 'inventory tl'];

        // 🟢 Dynamically set the URL
        $actionUrl = in_array($userRole, $allowedRoles) 
            ? route('prpo.approval-board') 
            : route('prpo.status.index');

        return [
            'message' => '🛒 PR Update: ' . $this->pr->department . ' Dept',
            'user_email' => $this->statusMessage . ' (' . $this->pr->branch . ')',
            'action_url' => $actionUrl 
        ];
    }
}