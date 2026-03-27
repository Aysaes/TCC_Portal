<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HrRequest extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'status',
        'name',
        'reason',
        'specific_details',
        'remarks',
    ];

    // Connects the request to the User who made it
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}