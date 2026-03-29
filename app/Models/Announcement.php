<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    protected $fillable = [
        'title',
        'author',
        'content',
        'priority_level_id',
        'attachment_path',
        'image_path',
    ];

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'announcement_branch');
    }

    public function priorityLevel(): BelongsTo
    {
        return $this->belongsTo(PriorityLevel::class, 'priority_level_id');
    }
}
