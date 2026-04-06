<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewDocumentAlert extends Notification
{
    use Queueable;

    public $documentName;
    public $uploaderName;

    // We pass the name of the file and who uploaded it
    public function __construct($documentName, $uploaderName = 'Admin')
    {
        $this->documentName = $documentName;
        $this->uploaderName = $uploaderName;
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
            'message' => '📁 New Document: ' . $this->documentName,
            'user_email' => 'Uploaded by ' . $this->uploaderName,
            
            // 🟢 Change this to your actual document repository route!
            'action_url' => route('admin.documents.index') 
        ];
    }
}