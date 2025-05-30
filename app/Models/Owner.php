<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Owner extends Model
{
    use HasFactory;

    // Allow mass assignment for all attributes
    protected $guarded = [];

    protected $fillable = [
        'admin_id',
        'name',
        'phone_number',
        'profile',
    ];

    /**
     * Get the admin associated with the owner.
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Get the users that work for this owner.
     */
    public function users()
    {
        return $this->hasMany(User::class, 'works_for');
    }

    public function stores()
    {
        return $this->hasMany(Store::class);
    }
}
