<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Item;
use App\Models\Sale;
use App\Models\ShopInventory;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Models\Shop;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\DashboardController as ApiDashboardController;

class DashboardController extends Controller
{
    public function index()
    {
        // Get dashboard data from API controller
        $apiController = new ApiDashboardController();
        $stats = $apiController->index();
        
        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }

    private function getSalesChartData($ownerId)
    {
        // Get sales for the last 30 days
        $startDate = Carbon::now()->subDays(30)->startOfDay();
        $endDate = Carbon::now()->endOfDay();

        $sales = Sale::where('owner_id', $ownerId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        // Group sales by day
        $salesByDay = $sales->groupBy(function($sale) {
            return Carbon::parse($sale->created_at)->format('Y-m-d');
        });

        // Create an array of all days in the range
        $dateRange = [];
        $currentDate = $startDate->copy();
        while ($currentDate <= $endDate) {
            $dateKey = $currentDate->format('Y-m-d');
            $dateRange[$dateKey] = [
                'date' => $dateKey,
                'total' => 0,
                'count' => 0,
            ];
            $currentDate->addDay();
        }

        // Fill in sales data
        foreach ($salesByDay as $date => $daySales) {
            if (isset($dateRange[$date])) {
                $dateRange[$date]['total'] = $daySales->sum('total');
                $dateRange[$date]['count'] = $daySales->count();
            }
        }

        return array_values($dateRange);
    }
} 