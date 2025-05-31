<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    // Allow mass assignment for all attributes
    protected $guarded = [];

    protected $fillable = [
        'shop_id',
        'item_id',
        'item_name',
        'quantity',
        'total',
        'paid',
        'credit',
        'customer_id',
        'owner_id',
        'note',
        'status',
        'sale_price',
        'quantity_sold',
        'received_price',
        'payment_status',
        'sold_at',
        'customer_id'
    ];

    protected function casts() : array
    {
        return [
            'payment_status' => \App\Enums\PaymentStatus::class,
            'sold_at' => 'datetime',
        ];
    }
    /**
     * Get the item that was sold.
     */
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the owner who recorded the sale.
     */
    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }

    public function approvedBy(){
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the shop that made the sale.
     */
    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    /**
     * Get the customer who made the purchase.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
