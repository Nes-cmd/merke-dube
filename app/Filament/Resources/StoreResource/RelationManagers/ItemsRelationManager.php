<?php

namespace App\Filament\Resources\StoreResource\RelationManagers;

use App\Enums\PaymentStatus;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables;
use Filament\Tables\Columns\Summarizers\Sum;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                Tables\Columns\ImageColumn::make('photo')->searchable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('unit_price')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('quantity')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('paid')->numeric()->summarize([
                    Sum::make()->label('Total paid')
                ]),
                Tables\Columns\TextColumn::make('credit')->numeric()->summarize([
                    Sum::make()->label('Total credit')
                ]),
                Tables\Columns\TextColumn::make('size')->searchable(),
                // Tables\Columns\TextColumn::make('color')->searchable(),
                Tables\Columns\TextColumn::make('category.name')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('subcategory.name')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('store.name')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('approvedBy.name')->numeric()->sortable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('Pay credit')->button()->button()->form([
                    Forms\Components\TextInput::make('paid')->numeric()->required()->default(fn(Model $record) => $record->credit),
                    Forms\Components\Select::make('status')->options(PaymentStatus::class)->required(),
                ])->action(function(Model $record, array $data){
                    $record->paid = $record->paid + $data['paid'];
                    $record->credit = $record->credit - $data['paid'];
                    $record->status = $data['status'];
                    $record->save();
                    Notification::make()->title('Credit payment updated successfully.')->success()->send();
                })
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }
}
