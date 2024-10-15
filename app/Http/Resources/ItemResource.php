<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'size' => $this->size,
            'color' => $this->color,
            'paid' => $this->paid,
            'credit' => $this->credit,
            'unit_price' => $this->unit_price,
            'quantity' => $this->quantity,
            'remark' => $this->remark,
            'status' => $this->status,
            'approvedBy' => $this->approvedBy,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'store' => $this->store,
            'owner' => $this->owner,
           
        ];
    }
}
