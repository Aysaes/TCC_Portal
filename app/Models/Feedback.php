<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    // Added 'image_path' to the array!
    protected $fillable = ['user_id', 'type', 'subject', 'message', 'image_path', 'is_anonymous'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}