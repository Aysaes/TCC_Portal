<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResourceLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 
        'url', 
        'description', 
        'type', 
        'is_active'
    ];
}
