<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_id',
        'name',
        'details',
        'unit',
        'price',
        'status', 
    ];

    // A Product belongs to one Supplier
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
}