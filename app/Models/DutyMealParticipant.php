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
        'shift_type',
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
