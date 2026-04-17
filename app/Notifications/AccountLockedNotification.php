<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AccountLockedNotification extends Notification
{
    use Queueable;

    public $lockedUser;

    public function __construct($lockedUser)
    {
        $this->lockedUser = $lockedUser;
    }

    // 1. Change the channel from 'mail' to 'database'
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    // 2. Delete the toMail() method entirely and replace it with toArray()
    public function toArray(object $notifiable): array
    {
        return [
            'locked_user_id' => $this->lockedUser->id,
            'locked_user_name' => $this->lockedUser->name,
            'locked_user_email' => $this->lockedUser->email,
            'message' => "{$this->lockedUser->name} has been locked out after 5 failed login attempts.",
            'action_url' => '/admin/employees', // So you can link directly to the unlock page in React
            'type' => 'security_alert'
        ];
    }
}