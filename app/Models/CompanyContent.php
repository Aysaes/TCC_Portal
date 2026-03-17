<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyContent extends Model
{
    protected $fillable = [
        'type',
        'title',
        'content',
        'image_path',
    ];
}
