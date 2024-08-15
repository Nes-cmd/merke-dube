<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    // Allow mass assignment for all attributes
    protected $guarded = [];

    /**
     * Get the category that the item belongs to.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the subcategory that the item belongs to.
     */
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Get the store where the item is available.
     */
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Get the owner who owns the item.
     */
    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }

    public function approvedBy(){
        return $this->belongsTo(User::class, 'approved_by');
    }
}
