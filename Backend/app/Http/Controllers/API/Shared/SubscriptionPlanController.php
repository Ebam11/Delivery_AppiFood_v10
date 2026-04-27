<?php

namespace App\Http\Controllers\API\Shared;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;

class SubscriptionPlanController extends Controller
{
    public function index(): JsonResponse
    {
        $plans = SubscriptionPlan::active()
            ->orderBy('monthly_price')
            ->get()
            ->map(fn (SubscriptionPlan $plan) => $this->formatPlan($plan))
            ->values();

        return response()->json(['data' => $plans]);
    }

    private function formatPlan(SubscriptionPlan $plan): array
    {
        return [
            'id' => $plan->id,
            'name' => $plan->name,
            'monthly_price' => $plan->monthly_price,
            'annual_price' => $plan->annual_price,
            'max_products' => $plan->max_products,
            'commission_percentage' => $plan->commission_percentage,
            'features' => $plan->features ?? [],
            'is_active' => $plan->is_active,
        ];
    }
}
