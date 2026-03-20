<?php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->get();

        return response()->json(['data' => $addresses]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'    => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:255'],
            'lat'     => ['nullable', 'numeric'],
            'lng'     => ['nullable', 'numeric'],
        ]);

        $user = $request->user();

        // Si es la primera dirección, ponerla como default
        $isDefault = Address::where('user_id', $user->id)->count() === 0;

        $address = Address::create([
            'user_id'    => $user->id,
            'name'       => $request->name,
            'address'    => $request->address,
            'lat'        => $request->lat,
            'lng'        => $request->lng,
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'message' => 'Dirección agregada.',
            'data'    => $address,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name'    => ['sometimes', 'string', 'max:50'],
            'address' => ['sometimes', 'string', 'max:255'],
            'lat'     => ['nullable', 'numeric'],
            'lng'     => ['nullable', 'numeric'],
        ]);

        $address = Address::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $address->update($request->only('name', 'address', 'lat', 'lng'));

        return response()->json([
            'message' => 'Dirección actualizada.',
            'data'    => $address,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $address = Address::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $address->delete();

        return response()->json(['message' => 'Dirección eliminada.']);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $address = Address::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $address->setAsDefault();

        return response()->json([
            'message' => 'Dirección principal actualizada.',
            'data'    => $address,
        ]);
    }
}