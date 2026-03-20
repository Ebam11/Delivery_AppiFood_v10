<?php

namespace App\Http\Controllers\API\Admin;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'users' => [
                    'total'       => User::count(),
                    'customers'   => User::byRole(UserRole::USER)->count(),
                    'restaurants' => User::byRole(UserRole::RESTAURANT)->count(),
                    'new_today'   => User::whereDate('created_at', today())->count(),
                ],
                'restaurants' => [
                    'total'    => Restaurant::count(),
                    'active'   => Restaurant::active()->count(),
                    'verified' => Restaurant::verified()->count(),
                    'pending'  => Restaurant::where('is_verified', false)->count(),
                ],
                'orders' => [
                    'total'     => Order::count(),
                    'today'     => Order::whereDate('created_at', today())->count(),
                    'pending'   => Order::byStatus(OrderStatus::PENDING)->count(),
                    'delivered' => Order::byStatus(OrderStatus::DELIVERED)->count(),
                    'cancelled' => Order::byStatus(OrderStatus::CANCELLED)->count(),
                ],
                'revenue' => [
                    'total'      => Order::byStatus(OrderStatus::DELIVERED)->sum('total'),
                    'today'      => Order::byStatus(OrderStatus::DELIVERED)->whereDate('created_at', today())->sum('total'),
                    'this_month' => Order::byStatus(OrderStatus::DELIVERED)->whereMonth('created_at', now()->month)->sum('total'),
                ],
            ],
        ]);
    }
}