<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PasswordResetAlert extends Notification
{
    use Queueable;

    public $user;

    public function __construct($user)
    {
        $this->user = $user;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => '🔐 Password Reset Request',
            'user_email' => $this->user->name . ' requested a reset.',
            
            
            'action_url' => route('admin.employees') 
        ];
    }
}