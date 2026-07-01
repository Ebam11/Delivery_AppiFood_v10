<?php

namespace App\Http\Controllers\API\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => $request->password,
            'phone'    => $request->phone,
            'id_number' => $request->id_number,
            'birth_date'=> $request->birth_date,
            'gender'    => $request->gender,
            'role'     => $request->role ?? UserRole::USER->value,
            'status'   => true,
        ]);

        if (($request->role ?? UserRole::USER->value) === UserRole::RESTAURANT->value) {
            $restaurant = Restaurant::create([
                'user_id' => $user->id,
                'name' => $request->restaurant_name ?: $request->name,
                'address' => $request->address ?? 'Popayán, Cauca',
                'phone' => $request->phone ?? null,
                'email' => $request->email ?? null,
                'lat' => 2.4448,
                'lng' => -76.6147,
                'logo' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900',
                'banner' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900',
                'is_active' => true,
                'is_verified' => true,
            ]);

            // Asignar categoría por defecto (Restaurantes Locales)
            $defaultCat = \App\Models\RestaurantCategory::where('name', 'Restaurantes Locales')->first();
            if ($defaultCat) {
                $restaurant->restaurantCategories()->syncWithoutDetaching([$defaultCat->id]);
            }

            // Crear un horario por defecto para que aparezca abierto (24/7)
            $daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            foreach ($daysOfWeek as $day) {
                \App\Models\RestaurantSchedule::create([
                    'restaurant_id' => $restaurant->id,
                    'day' => $day,
                    'opening_time' => '00:00:00',
                    'closing_time' => '23:59:00',
                    'is_closed' => false,
                ]);
            }

            // Crear una zona de entrega por defecto
            \App\Models\DeliveryZone::create([
                'restaurant_id' => $restaurant->id,
                'name' => 'Zona Urbana',
                'delivery_cost' => 3000,
                'delivery_time_min' => 30,
            ]);

            // Limpiar la caché de restaurantes para que aparezca inmediatamente
            \Illuminate\Support\Facades\Cache::flush();
        }

        $token = $user->createToken('api-token')->plainTextToken;

        // Generar refresh token
        $refreshToken = Str::random(128);
        $user->update([
            'refresh_token_hash' => Hash::make($refreshToken),
            'refresh_token_expires_at' => now()->addDays(30),
            'last_login_at' => now(),
        ]);

        return response()->json([
            'message' => '¡Registro exitoso!',
            'data' => [
                'access_token' => $token,
                'refresh_token' => $refreshToken,
                'expires_in' => 3600,
                'type' => 'Bearer',
                'user' => new UserResource($user),
            ]
        ], 201);
    }
}
