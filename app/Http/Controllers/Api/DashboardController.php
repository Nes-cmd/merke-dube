<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Sale;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $owner = $user->owner;

        $myItems = Item::where('owner_id', $owner->id);
        $mySales = Sale::where('owner_id', $owner->id);
        return  [
            'products' => [
                'value' => $myItems->count(),
                'label'  => ['am' => 'እቃዎች', 'en' => 'Products'],
                'description' => ['am' => 'አጠቃላይ የእቃዎች ብዛት', 'en' => 'All products count'],
            ],
            'sales' => [
                'value' => $mySales->count(),
                'label'  => ['am' => 'የሽያጭ ብዛት', 'en' => 'Sales count'],
                'description' => ['am' => 'አጠቃላይ የሽያጭ ብዛት', 'en' => 'All sales count'],
            ],
            // 
            'payable_credit' => [
                'value' => $myItems->sum('credit'),
                'label'  => ['am' => 'የሚከፈል ዱቤ', 'en' => 'Sum of credit'],
                'description' => ['am' => 'አጠቃላይ የሚከፈል ዱቤ ድምር', 'en' => 'Sum of credit to be payed'],
            ],
            'collectable_credit' => [
                'value' => $mySales->sum('credit'),
                'label'  => ['am' => 'የሚሰበሰብ ዱቤ', 'en' => 'Collectable credit'],
                'description' => ['am' => 'አጠቃላይ የሚሰበሰብ ዱቤ ድምር', 'en' => 'Sum of credit to be collected'],
            ],

            'sales_of_last_30' => [
                'value' => $mySales->whereDay('created_at', '>=', now()->subDays(30))->count(),
                'label'  => ['am' => 'የ30 ቀን ሽያጭ', 'en' => '30 days sale'],
                'description' => ['am' => 'ያለፈው የ30 ቀን ሽያጭ ብዛት', 'en' => 'Past 30 days sales count'],
            ],
        ];
    }
}
