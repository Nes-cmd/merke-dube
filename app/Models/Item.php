<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    // Allow mass assignment for all attributes
    protected $guarded = [];

    protected $fillable = [
        'name',
        'color',
        'size',
        'photo',
        'status',
        'unit_price',
        'quantity',
        'remark',
        'approved_by',
        'category_id',
        'subcategory_id',
        'store_id',
        'owner_id',
        'supplier_id',
        'sku',
        'batch_number',
        'code',
        'manufacture_date',
        'expiry_date',
        'refill_count',
        'last_refill_date',
    ];

    protected $casts = [
        'status' => \App\Enums\PaymentStatus::class,
        'manufacture_date' => 'date',
        'expiry_date' => 'date',
        'last_refill_date' => 'datetime',
    ];

    /**
     * Get the category that owns the item.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the subcategory that owns the item.
     */
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Get the store that owns the item.
     */
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the owner that owns the item.
     */
    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }

    /**
     * Get the user who approved this item.
     */
    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the supplier for this item.
     */
    public function supplier()
    {
        return $this->belongsTo(Customer::class, 'supplier_id');
    }

    /**
     * Get sales for this item.
     */
    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    /**
     * Get all images for this item.
     */
    public function images()
    {
        return $this->hasMany(ItemImage::class)->orderBy('sort_order');
    }

    /**
     * Get the primary image for this item.
     */
    public function primaryImage()
    {
        return $this->hasOne(ItemImage::class)->where('is_primary', true);
    }

    /**
     * Check if the item is expired or about to expire.
     * 
     * @param int $warningDays Days before expiry to show warning
     * @return string|null 'expired', 'expiring_soon', or null if not applicable
     */
    public function expiryStatus($warningDays = 30)
    {
        if (!$this->expiry_date) {
            return null;
        }
        
        $today = now()->startOfDay();
        $expiryDate = $this->expiry_date->startOfDay();
        
        if ($expiryDate->isPast()) {
            return 'expired';
        }
        
        $daysUntilExpiry = $today->diffInDays($expiryDate);
        if ($daysUntilExpiry <= $warningDays) {
            return 'expiring_soon';
        }
        
        return null;
    }
    
    /**
     * Get refill history for this item.
     */
    public function refills()
    {
        return $this->hasMany(ItemRefill::class)->orderBy('created_at', 'desc');
    }
}
