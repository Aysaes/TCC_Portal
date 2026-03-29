<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'branch', 'department', 'date_prepared', 'request_type', 
        'priority', 'date_needed', 'budget_status', 'budget_ref', 
        'no_of_quotations', 'purpose_of_request', 'impact_if_not_procured', 'status'
    ];

    public function items()
    {
        return $this->hasMany(PurchaseRequestItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}