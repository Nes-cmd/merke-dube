<?php

namespace App\Filament\Resources;

use App\Enums\PaymentStatus;
use App\Filament\Resources\ItemResource\Pages;
use App\Filament\Resources\ItemResource\RelationManagers;
use App\Models\Category;
use App\Models\Item;
use App\Models\Store;
use App\Models\Subcategory;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\Summarizers\Sum;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ItemResource extends Resource
{
    protected static ?string $model = Item::class;

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-right-end-on-rectangle';

    public static function form(Form $form): Form
    {
        $user = auth()->user();
        return $form
            ->schema([
                Forms\Components\Section::make([
                    Forms\Components\TextInput::make('name')->required()->maxLength(255),
                    Forms\Components\TextInput::make('unit_price')->numeric()->live(true)->required()->afterStateUpdated(function(callable $get, callable $set){
                        if($get('unit_price') == "" ||  $get('quantity') == "" || $get('paid') == ""|| $get('credit') == "") return;
                        $set('credit', $get('unit_price') * $get('quantity') - $get('paid'));   
                    }),
                    Forms\Components\TextInput::make('quantity')->live(true)->label('Quantity/Pieces')->required()->numeric()->default(0)->afterStateUpdated(function(callable $get, callable $set){
                        if($get('unit_price') == "" ||  $get('quantity') == "" || $get('paid') == ""|| $get('credit') == "") return;
                        $set('credit', $get('unit_price') * $get('quantity') - $get('paid'));   
                    }),
                    Forms\Components\Select::make('store_id')->label('Store')->required()->searchable()
                        ->default(Store::where('owner_id', $user->works_for)->first()?->id)
                        ->options(Store::where('owner_id', $user->works_for)->pluck('name', 'id')),
                    Forms\Components\TextInput::make('paid')->live(true)->afterStateUpdated(function(callable $get, callable $set){
                        if($get('unit_price') == "" ||  $get('quantity') == "" || $get('paid') == ""|| $get('credit') == "") return;
                        $set('credit', $get('unit_price') * $get('quantity') - $get('paid'));   
                    })->numeric(),
                    Forms\Components\TextInput::make('credit')->live(true)->afterStateUpdated(function(callable $get, callable $set){
                        if($get('unit_price') == "" ||  $get('quantity') == "" || $get('paid') == ""|| $get('credit') == "") return;
                        $set('paid', $get('unit_price') * $get('quantity') - $get('credit'));   
                    })->numeric(),
                    Forms\Components\FileUpload::make('photo')->image()->resize(60)->optimize('jpeg')->imagePreviewHeight(100),
                    Forms\Components\Select::make('category_id')->label('Category')->required()->live()->options(Category::where('owner_id', $user->works_for)->pluck('name', 'id')),
                    Forms\Components\Select::make('subcategory_id')->label('Sub category')->options(function(callable $get){
                        if($get('category_id')){
                            return Subcategory::where('category_id', $get('category_id'))->pluck('name', 'id');
                        }
                        return [];
                    })->live(),
                    
                    Forms\Components\TextInput::make('color')->maxLength(255)->default(null),
                    Forms\Components\TextInput::make('size')->maxLength(255)->default(null),
                    Forms\Components\Textarea::make('remark')->columnSpanFull(),
                    Forms\Components\Hidden::make('owner_id')->default($user->works_for),
                    Forms\Components\Hidden::make('approved_by')->default(auth()->id()),
                ])->columns(2)
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
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

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListItems::route('/'),
            'create' => Pages\CreateItem::route('/create'),
            'edit' => Pages\EditItem::route('/{record}/edit'),
        ];
    }
}
