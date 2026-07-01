<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Coupon::included()->filter()->sort();

        if ($user->role->value !== 'admin') {
            $query->where('restaurant_id', $user->restaurant?->id);
        }

        $coupons = $query->getOrPaginate();

        return $this->respondCollection($coupons);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $rules = [
            'restaurant_id' => ['nullable', 'exists:restaurants,id'],
            'code' => ['required', 'string', 'max:80', 'unique:coupons,code'],
            'type' => ['required', Rule::in(['percentage', 'fixed'])],
            'value' => ['required', 'numeric', 'min:0.01'],
            'minimum_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', $request->filled('starts_at') ? 'after_or_equal:starts_at' : 'after_or_equal:today'],
            'is_active' => ['sometimes', 'boolean'],
        ];

        if ($user->role->value !== 'admin') {
            $rules['restaurant_id'] = ['nullable'];
        }

        $data = $request->validate($rules);
        $data['code'] = strtoupper(trim($data['code']));

        if ($user->role->value !== 'admin') {
            $data['restaurant_id'] = $user->restaurant?->id;
        }

        if ($data['type'] === 'percentage' && $data['value'] > 100) {
            return response()->json([
                'message' => 'Para cupones tipo porcentaje, el valor no puede ser mayor a 100.',
            ], 422);
        }

        $coupon = Coupon::create($data);

        return response()->json([
            'message' => 'Cupón creado.',
            'data' => $coupon,
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $query = Coupon::included();

        if ($user->role->value !== 'admin') {
            $query->where('restaurant_id', $user->restaurant?->id);
        }

        $coupon = $query->findOrFail($id);

        return response()->json(['data' => $coupon]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $query = Coupon::query();

        if ($user->role->value !== 'admin') {
            $query->where('restaurant_id', $user->restaurant?->id);
        }

        $coupon = $query->findOrFail($id);

        $rules = [
            'restaurant_id' => ['nullable', 'exists:restaurants,id'],
            'code' => ['sometimes', 'string', 'max:80', 'unique:coupons,code,' . $coupon->id],
            'type' => ['sometimes', Rule::in(['percentage', 'fixed'])],
            'value' => ['sometimes', 'numeric', 'min:0.01'],
            'minimum_order' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'used_count' => ['sometimes', 'integer', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', $request->filled('starts_at') ? 'after_or_equal:starts_at' : 'after_or_equal:today'],
            'is_active' => ['sometimes', 'boolean'],
        ];

        if ($user->role->value !== 'admin') {
            $rules['restaurant_id'] = ['nullable'];
        }

        $data = $request->validate($rules);

        if (array_key_exists('code', $data)) {
            $data['code'] = strtoupper(trim($data['code']));
        }

        if ($user->role->value !== 'admin') {
            $data['restaurant_id'] = $user->restaurant?->id;
        }

        $nextType = $data['type'] ?? $coupon->type;
        $nextValue = $data['value'] ?? $coupon->value;

        if ($nextType === 'percentage' && (float) $nextValue > 100) {
            return response()->json([
                'message' => 'Para cupones tipo porcentaje, el valor no puede ser mayor a 100.',
            ], 422);
        }

        $coupon->update($data);

        return response()->json([
            'message' => 'Cupón actualizado.',
            'data' => $coupon->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $query = Coupon::query();

        if ($user->role->value !== 'admin') {
            $query->where('restaurant_id', $user->restaurant?->id);
        }

        $coupon = $query->findOrFail($id);
        $coupon->delete();

        return response()->json(['message' => 'Cupón eliminado.']);
    }

    public function indexPublic(Request $request): JsonResponse
    {
        $coupons = Coupon::where('is_active', true)->orderBy('created_at', 'desc')->get();
        return response()->json(['data' => $coupons]);
    }

    private function respondCollection($result): JsonResponse
    {
        if ($result instanceof Paginator) {
            return response()->json($result);
        }

        return response()->json(['data' => $result]);
    }
}
