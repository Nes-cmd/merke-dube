<?php

namespace App\Filament\Resources\SaleResource\Pages;

use App\Filament\Resources\SaleResource;
use App\Models\Item;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
use Illuminate\Database\Eloquent\Model;

class EditSale extends EditRecord
{
    protected static string $resource = SaleResource::class;

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        $item = Item::find($data['item_id']);

        $item->quantity = $item->quantity - $data['quantity_sold'] + $record->quantity_sold;
        $item->save();

        $record->update($data); 
        return $record;
    }

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
