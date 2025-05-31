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

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login');
        }
        
        $owner = $user->owner;

        // Get inventory data
        $shopInventory = ShopInventory::whereHas('shop', function($query) use ($owner) {
            $query->where('owner_id', $owner->id);
        })->with(['item', 'shop'])->get();

        // Calculate total credit from shop inventory
        $totalCredit = $shopInventory->sum('credit');

        // Calculate total products value
        $totalProductsValue = $shopInventory->sum(function($inventory) {
            return $inventory->quantity * $inventory->item->unit_price;
        });

        // Get recent sales
        $recentSales = Sale::where('owner_id', $owner->id)
            ->with(['customer', 'shop'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get low stock items
        $lowStockItems = ShopInventory::whereHas('shop', function($query) use ($owner) {
            $query->where('owner_id', $owner->id);
        })
        ->where('quantity', '<', 5)  // Define your threshold for low stock
        ->with(['item', 'shop'])
        ->take(5)
        ->get();

        // Get items expiring soon
        $expiringItems = Item::where('owner_id', $owner->id)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '>', now())
            ->where('expiry_date', '<', now()->addDays(30))  // Items expiring in next 30 days
            ->with(['store'])
            ->take(5)
            ->get();

        // Get total customers
        $totalCustomers = Customer::where('owner_id', $owner->id)->count();

        // Get sales data for chart
        $salesData = $this->getSalesChartData($owner->id);

        return Inertia::render('Dashboard', [
            'totalCredit' => $totalCredit,
            'totalProductsValue' => $totalProductsValue,
            'recentSales' => $recentSales,
            'lowStockItems' => $lowStockItems,
            'expiringItems' => $expiringItems,
            'totalCustomers' => $totalCustomers,
            'salesData' => $salesData,
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