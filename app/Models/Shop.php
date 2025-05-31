<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'location',
        'phone',
        'description',
        'is_active',
    ];

    /**
     * Get the owner that owns the shop.
     */
    public function owner()
    {
        return $this->belongsTo(Owner::class, 'owner_id');
    }

    /**
     * Get the sales for the shop.
     */
    public function sales()
    {
        return $this->hasMany(Sale::class);
    }
    
    /**
     * Get the inventory items for this shop.
     */
    public function inventory()
    {
        return $this->hasMany(ShopInventory::class);
    }
} 