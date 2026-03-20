<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function sales(Request $request): JsonResponse
    {
        $request->validate([
            'from' => ['nullable', 'date'],
            'to'   => ['nullable', 'date'],
        ]);

        $from = $request->from ?? now()->startOfMonth();
        $to   = $request->to   ?? now()->endOfMonth();

        $salesByDay = Order::byStatus(OrderStatus::DELIVERED)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as orders, SUM(total) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => [
                'period'       => ['from' => $from, 'to' => $to],
                'total_orders' => $salesByDay->sum('orders'),
                'total_revenue'=> $salesByDay->sum('revenue'),
                'by_day'       => $salesByDay,
            ],
        ]);
    }

    public function restaurants(Request $request): JsonResponse
    {
        $restaurants = Restaurant::withCount('orders')
            ->withSum(['orders' => fn($q) => $q->byStatus(OrderStatus::DELIVERED)], 'total')
            ->orderByDesc('orders_sum_total')
            ->limit(10)
            ->get()
            ->map(fn($r) => [
                'id'          => $r->id,
                'name'        => $r->name,
                'total_orders'=> $r->orders_count,
                'revenue'     => $r->orders_sum_total ?? 0,
                'rating'      => $r->average_rating,
            ]);

        return response()->json(['data' => $restaurants]);
    }

    public function users(Request $request): JsonResponse
    {
        $newUsersPerMonth = User::selectRaw('MONTH(created_at) as month, COUNT(*) as total')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'data' => [
                'total'           => User::count(),
                'new_this_month'  => User::whereMonth('created_at', now()->month)->count(),
                'new_per_month'   => $newUsersPerMonth,
            ],
        ]);
    }
}