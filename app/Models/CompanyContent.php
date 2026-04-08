<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyContent extends Model
{
    protected $fillable = [
        'type',
        'title',
        'content',
        'content_html', // Added for Rich Text
        'image_path',
        'image_zoom',     // Added for Cropper
        'image_offset_x', // Added for Cropper
        'image_offset_y', // Added for Cropper
    ];
}
