<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Sale;
use App\Models\CreditSale;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $ownerId = $user->works_for;

        $totalProducts = Item::where('owner_id', $ownerId)->count();
        $totalSales = Sale::where('owner_id', $ownerId)->count();
        
        // Calculate total credit amounts
        $collectableCredit = Sale::where('owner_id', $ownerId)
            ->where('credit', '>', 0)
            ->sum('credit');
            
        // Get recent sales (last 30 days)
        $recentSales = Sale::where('owner_id', $ownerId)
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->count();

        return [
            'products' => [
                'value' => $totalProducts,
                'label'  => ['am' => 'እቃዎች', 'en' => 'Products'],
                'description' => ['am' => 'አጠቃላይ የእቃዎች ብዛት', 'en' => 'All products count'],
            ],
            'sales' => [
                'value' => $totalSales,
                'label'  => ['am' => 'የሽያጭ ብዛት', 'en' => 'Sales count'],
                'description' => ['am' => 'አጠቃላይ የሽያጭ ብዛት', 'en' => 'All sales count'],
            ],
            'payable_credit' => [
                'value' => 0, // Not tracking payable credit currently
                'label'  => ['am' => 'የሚከፈል ዱቤ', 'en' => 'Sum of credit'],
                'description' => ['am' => 'አጠቃላይ የሚከፈል ዱቤ ድምር', 'en' => 'Sum of credit to be payed'],
                'precision' => 2
            ],
            'collectable_credit' => [
                'value' => $collectableCredit,
                'label'  => ['am' => 'የሚሰበሰብ ዱቤ', 'en' => 'Collectable credit'],
                'description' => ['am' => 'አጠቃላይ የሚሰበሰብ ዱቤ ድምር', 'en' => 'Sum of credit to be collected'],
                'precision' => 2
            ],
            'sales_of_last_30' => [
                'value' => $recentSales,
                'label'  => ['am' => 'የ30 ቀን ሽያጭ', 'en' => '30 days sale'],
                'description' => ['am' => 'ያለፈው የ30 ቀን ሽያጭ ብዛት', 'en' => 'Past 30 days sales count'],
            ],
        ];
    }
}
