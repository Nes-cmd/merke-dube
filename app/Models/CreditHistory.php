<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CreditHistory extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $fillable = [
        'creditable_type',
        'creditable_id',
        'value',
        'approver_id',
        'owner_id',
        'note',
    ];

    public function approver()  {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
