<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    // Allow mass assignment for all attributes
    protected $guarded = [];

    /**
     * Get the owner that owns the store.
     */
    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }
}
