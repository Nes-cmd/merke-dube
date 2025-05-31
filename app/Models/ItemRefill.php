<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemRefill extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'quantity',
        'purchase_price',
        'supplier_id',
        'batch_number',
        'manufacture_date',
        'expiry_date',
        'notes',
        'refilled_by',
    ];

    protected $casts = [
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
    ];

    /**
     * Get the item that was refilled.
     */
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    /**
     * Get the supplier for this refill.
     */
    public function supplier()
    {
        return $this->belongsTo(Customer::class, 'supplier_id');
    }

    /**
     * Get the user who performed the refill.
     */
    public function refilledBy()
    {
        return $this->belongsTo(User::class, 'refilled_by');
    }
} 