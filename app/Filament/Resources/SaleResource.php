<?php

namespace App\Filament\Resources;

use App\Enums\PaymentStatus;
use App\Filament\Resources\SaleResource\Pages;
use App\Filament\Resources\SaleResource\RelationManagers;
use App\Models\Item;
use App\Models\Sale;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class SaleResource extends Resource
{
    protected static ?string $model = Sale::class;

    protected static ?string $navigationIcon = 'heroicon-o-currency-dollar';

    protected static ?int $navigationSort = 4;

    public static function form(Form $form): Form
    {
        $user = auth()->user();
        return $form
            ->schema([
                Forms\Components\Section::make([
                    Forms\Components\Select::make('item_id')->required()->live(true)->options(Item::where('owner_id', $user->works_for)->pluck('name', 'id'))->searchable()->label('Item'),

                    Forms\Components\TextInput::make('sale_price')->required()->live(true)->numeric()->afterStateUpdated(function (callable $get, callable $set) {
                        if($get('sale_price') == "" ||  $get('quantity_sold') == "" || $get('received_price') == ""|| $get('credit') == "") return;
                        $set('credit', $get('sale_price') * $get('quantity_sold') - $get('received_price'));
                    })->helperText(function (callable $get) {
                        if ($get('item_id')) {
                            $price = Item::find($get('item_id'))->unit_price;
                            return "I was bought by {$price}";
                        }
                    }),

                    Forms\Components\TextInput::make('quantity_sold')->required()->live(true)->numeric()->afterStateUpdated(function (callable $get, callable $set) {
                        if($get('sale_price') == "" ||  $get('quantity_sold') == "" || $get('received_price') == ""|| $get('credit') == "") return;
                        $set('credit', $get('sale_price') * $get('quantity_sold') - $get('received_price'));
                    })->helperText(function (callable $get) {
                        if ($get('item_id')) {
                            $quantity = Item::find($get('item_id'))->quantity;
                            return "You have {$quantity}";
                        }
                    }),

                    Forms\Components\TextInput::make('received_price')->required()->live(true)->numeric()->afterStateUpdated(function (callable $get, callable $set) {
                        if($get('sale_price') == "" ||  $get('quantity_sold') == "" || $get('received_price') == ""|| $get('credit') == "") return;
                        $set('credit', $get('sale_price') * $get('quantity_sold') - $get('received_price'));
                    }),
                    Forms\Components\TextInput::make('credit')->required()->numeric()->live(true)->default(0)->afterStateUpdated(function (callable $get, callable $set) {
                        if($get('sale_price') == "" ||  $get('quantity_sold') == "" || $get('received_price') == ""|| $get('credit') == "") return;
                        $set('received_price', $get('sale_price') * $get('quantity_sold') - $get('credit'));
                    }),

                    Forms\Components\Select::make('payment_status')->required()->options(PaymentStatus::class)->default('Pending'),
                    Forms\Components\DateTimePicker::make('sold_at')->native(false)->default(now()),
                    Forms\Components\TextInput::make('note')->maxLength(255)->default(null)->columnSpanFull(),
                    Forms\Components\Hidden::make('approved_by')->default($user->works_for),
                ])->columns()
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('item.name')->sortable(),
                Tables\Columns\TextColumn::make('sale_price')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('quantity_sold')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('received_price')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('credit')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('payment_status')->badge(),
                Tables\Columns\TextColumn::make('sold_at')->dateTime()->sortable(),
                Tables\Columns\TextColumn::make('note')->searchable()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('approvedBy.name')
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->numeric()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('payment_status')->options(PaymentStatus::class)
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('Credit received')->button()->form([
                    Forms\Components\TextInput::make('received_price')->numeric()->required()->default(fn(Model $record) => $record->credit),
                    Forms\Components\Select::make('status')->options(PaymentStatus::class)->required(),
                ])->action(function(Model $record, array $data){
                    $record->credit = $record->credit - $data['received_price'];
                    $record->received_price = $record->received_price + $data['received_price'];
                    $record->payment_status = $data['status'];
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

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSales::route('/'),
            'create' => Pages\CreateSale::route('/create'),
            'edit' => Pages\EditSale::route('/{record}/edit'),
        ];
    }
}
