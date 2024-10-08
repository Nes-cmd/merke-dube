<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    // Allow mass assignment for all attributes
    protected $guarded = [];

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
}
