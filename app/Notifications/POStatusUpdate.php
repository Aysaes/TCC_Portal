<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class POStatusUpdate extends Notification
{
    use Queueable;

    public $po;
    public $statusMessage;

    public function __construct($po, $statusMessage)
    {
        $this->po = $po;
        $this->statusMessage = $statusMessage;
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        // Safely grab the supplier name if it exists
        $supplierName = $this->po->supplier->name ?? 'Supplier';

        return [
            'message' => '📦 PO Update: ' . $this->po->po_number,
            'user_email' => $this->statusMessage . ' (' . $supplierName . ')',
            
            // 🟢 Send them to the PO Generation / Masterlist board
            'action_url' => route('prpo.purchase-orders.index') 
        ];
    }
}