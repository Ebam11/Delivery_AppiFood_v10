<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Resources\RestaurantResource;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileRestaurantController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json(['message' => 'No tienes un restaurante registrado.'], 404);
        }

        return response()->json([
            'data' => new RestaurantResource($restaurant->load('restaurantCategories', 'schedules')),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name'              => ['sometimes', 'string', 'max:150'],
            'description'       => ['nullable', 'string', 'max:500'],
            'address'           => ['sometimes', 'string', 'max:255'],
            'phone'             => ['nullable', 'string', 'max:20'],
            'email'             => ['nullable', 'email'],
            'delivery_cost'     => ['sometimes', 'numeric', 'min:0'],
            'minimum_order'     => ['sometimes', 'numeric', 'min:0'],
            'delivery_time_min' => ['sometimes', 'integer', 'min:1'],
            'category_ids'      => ['nullable', 'array'],
            'category_ids.*'    => ['exists:restaurant_categories,id'],
            'is_active'         => ['sometimes', 'boolean'],
            'opening_time'      => ['sometimes', 'date_format:H:i'],
            'closing_time'      => ['sometimes', 'date_format:H:i'],
        ]);

        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            // Crear restaurante si no existe
            $restaurant = Restaurant::create(array_merge(
                $request->only('name', 'description', 'address', 'phone', 'email', 'delivery_cost', 'minimum_order', 'delivery_time_min'),
                ['user_id' => $request->user()->id]
            ));
        } else {
            $restaurant->update($request->only(
                'name', 'description', 'address', 'phone', 'email',
                'delivery_cost', 'minimum_order', 'delivery_time_min', 'is_active'
            ));
        }

        // Actualizar categorías del restaurante
        if ($request->has('category_ids')) {
            $restaurant->restaurantCategories()->sync($request->category_ids);
        }

        // Actualizar horarios si se proporcionan
        if ($request->has('opening_time') && $request->has('closing_time')) {
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            foreach ($days as $day) {
                \App\Models\RestaurantSchedule::updateOrCreate(
                    ['restaurant_id' => $restaurant->id, 'day' => $day],
                    ['opening_time' => $request->opening_time, 'closing_time' => $request->closing_time, 'is_closed' => false]
                );
            }
        }

        return response()->json([
            'message' => 'Perfil del restaurante actualizado.',
            'data'    => new RestaurantResource($restaurant->fresh()->load('restaurantCategories')),
        ]);
    }

    public function logo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $restaurant = $request->user()->restaurant;

        if ($restaurant->logo) {
            Storage::disk('public')->delete($restaurant->logo);
        }

        $path = $request->file('logo')->store('restaurants/logos', 'public');
        $restaurant->update(['logo' => $path]);

        return response()->json([
            'message' => 'Logo actualizado.',
            'logo'    => asset('storage/' . $path),
        ]);
    }

        public function banner(Request $request): JsonResponse
    {
        $request->validate([
            'banner' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);
    
        $restaurant = $request->user()->restaurant;
    
        if ($restaurant->banner) {
            Storage::disk('public')->delete($restaurant->banner);
        }
    
        $path = $request->file('banner')->store('restaurants/banners', 'public');
        $restaurant->update(['banner' => $path]);
    
        return response()->json([
            'message' => 'Portada actualizada.',
            'banner'  => asset('storage/' . $path),
        ]);
    }
}