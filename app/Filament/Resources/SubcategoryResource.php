<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubcategoryResource\Pages;
use App\Filament\Resources\SubcategoryResource\RelationManagers;
use App\Models\Category;
use App\Models\Subcategory;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class SubcategoryResource extends Resource
{
    protected static ?string $model = Subcategory::class;

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationGroup = 'Others';

    protected static ?string $navigationIcon = 'heroicon-o-bars-3-center-left';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make([
                    Forms\Components\Select::make('category_id')->label('Category')->required()->options(Category::where('owner_id', auth()->user()->works_for)->pluck('name', 'id'))->searchable(),
                    Forms\Components\TextInput::make('name')->required()->maxLength(255),
                    // Forms\Components\FileUpload::make('icon')->default(null),
                    Forms\Components\TextInput::make('default_price')->required()->numeric()->default(0.00),
                    Forms\Components\TextInput::make('minimum_sale_price')->required()->numeric()->default(0.00),
                    Forms\Components\Textarea::make('description')->columnSpanFull(),
                ])->columns(2)
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('category.name')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('name')->searchable(),
                // Tables\Columns\TextColumn::make('icon')->searchable(),
                Tables\Columns\TextColumn::make('default_price')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('minimum_sale_price')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListSubcategories::route('/'),
            'create' => Pages\CreateSubcategory::route('/create'),
            'edit' => Pages\EditSubcategory::route('/{record}/edit'),
        ];
    }
}
