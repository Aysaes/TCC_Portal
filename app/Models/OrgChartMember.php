<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrgChartMember extends Model
{
    protected $fillable = [
        'name',
        'position',
        'branch',
        'sort_order',
        'image_path',
    ];
}