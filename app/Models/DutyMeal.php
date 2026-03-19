<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DutyMeal extends Model
{
    protected $fillable = [
        'branch_id',
        'duty_date',
        'main_meal',
        'alt_meal',
        'is_locked',
    ];

    protected $casts = [
        'duty_date' => 'date',
        'is_locked' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(DutyMealParticipant::class);
    }
}
