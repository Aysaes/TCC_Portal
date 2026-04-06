<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewFeedbackAlert extends Notification
{
    use Queueable;

    public $feedbackType;
    public $submitterName;

    public function __construct($feedbackType, $submitterName)
    {
        $this->feedbackType = $feedbackType;
        $this->submitterName = $submitterName;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            // Example: "New Suggestion Submitted" or "New Complaint Submitted"
            'message' => '💬 New ' . $this->feedbackType . ' Submitted',
            'user_email' => 'From: ' . $this->submitterName,
            
            // 🟢 Change this to your actual HR Feedback Admin route!
            'action_url' => route('hr.feedback.index') 
        ];
    }
}