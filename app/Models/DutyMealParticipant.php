<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DutyMealParticipant extends Model
{
    protected $fillable = [
        'duty_meal_id',
        'user_id',
        'choice',
        'custom_request',
        'is_graveyard', 
        'is_delivered', // <-- Added this to allow saving
        'shift_type',   // <-- Added this to allow saving your new React shift selections!
        'site',          // <-- Added this to allow saving the site informationz
    ];

    protected $casts = [
        'is_graveyard' => 'boolean',
        'is_delivered' => 'boolean', // <-- Good practice to cast this to boolean
    ];

    public function dutyMeal(): BelongsTo
    {
        return $this->belongsTo(DutyMeal::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}