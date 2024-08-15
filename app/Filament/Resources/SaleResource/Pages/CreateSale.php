<?php

namespace App\Filament\Resources\SaleResource\Pages;

use App\Filament\Resources\SaleResource;
use App\Models\Item;
use App\Models\Sale;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;

class CreateSale extends CreateRecord
{
    protected static string $resource = SaleResource::class;

    protected function handleRecordCreation(array $data): Model
    {
        $user = auth()->user();
        $data['owner_id'] = $user->works_for;
        $data['approved_by'] = $user->id;

        $item = Item::find($data['item_id']);
        $item->quantity = $item->quantity - $data['quantity_sold'];
        $item->save();

        
        return Sale::create($data);
    }
}
