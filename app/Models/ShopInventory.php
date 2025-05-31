<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'item_id',
        'quantity',
        'selling_price',
    ];

    /**
     * Get the shop that owns the inventory.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the item.
     */
    public function item()
    {
        return $this->belongsTo(Item::class);
    }
} 