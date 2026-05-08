<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Restaurant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    /**
     * Obtener lista de productos del restaurante
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'restaurant') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $restaurant = Restaurant::where('user_id', $user->id)->first();

            if (!$restaurant) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }

            $products = Product::where('restaurant_id', $restaurant->id)
                ->with('category')
                ->get()
                ->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'price' => (float)$product->price,
                        'discount_price' => $product->discount_price ? (float)$product->discount_price : null,
                        'category' => $product->category?->name ?? 'Sin categoría',
                        'category_name' => $product->category?->name ?? 'Sin categoría',
                        'category_id' => $product->category_id,
                        'image' => $product->image,
                        'img' => $product->image,
                        'is_available' => (bool)$product->is_available,
                        'active' => (bool)$product->is_available,
                        'is_featured' => (bool)$product->is_featured,
                        'rating' => 0,
                        'orders' => 0,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Crear nuevo producto
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'restaurant') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $restaurant = Restaurant::where('user_id', $user->id)->first();

            if (!$restaurant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Restaurante no encontrado',
                ], 404);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'discount_price' => 'nullable|numeric|min:0',
                'category_id' => 'nullable|exists:categories,id',
                'image' => 'nullable|string',
                'is_available' => 'boolean',
                'is_featured' => 'boolean',
            ]);

            $imageUrl = $validated['image'] ?? null;

            // Si suben una foto de verdad
            if ($request->hasFile('image_file')) {
                $subida = $request->file('image_file')->storeOnCloudinary('appifood/products');
                $imageUrl = $subida->getSecurePath();
            }

            $product = Product::create([
                'restaurant_id' => $restaurant->id,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'price' => $validated['price'],
                'discount_price' => $validated['discount_price'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'image' => $imageUrl,
                'is_available' => $validated['is_available'] ?? true,
                'is_featured' => $validated['is_featured'] ?? false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => (float)$product->price,
                    'discount_price' => $product->discount_price ? (float)$product->discount_price : null,
                    'category_id' => $product->category_id,
                    'category' => $product->category?->name ?? 'Sin categoría',
                    'image' => $product->image,
                    'is_available' => (bool)$product->is_available,
                    'active' => (bool)$product->is_available,
                    'is_featured' => (bool)$product->is_featured,
                    'rating' => 0,
                    'orders' => 0,
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener detalle de un producto
     */
    public function show(int $id): JsonResponse
    {
        try {
            $product = Product::with('category')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => (float)$product->price,
                    'discount_price' => $product->discount_price ? (float)$product->discount_price : null,
                    'category_id' => $product->category_id,
                    'category' => $product->category?->name,
                    'image' => $product->image,
                    'is_available' => (bool)$product->is_available,
                    'is_featured' => (bool)$product->is_featured,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Producto no encontrado',
            ], 404);
        }
    }

    /**
     * Actualizar producto
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'restaurant') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $product = Product::findOrFail($id);

            if ($product->restaurant_id !== $user->restaurant->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'string|max:255',
                'description' => 'nullable|string',
                'price' => 'numeric|min:0',
                'discount_price' => 'nullable|numeric|min:0',
                'category_id' => 'nullable|exists:categories,id',
                'image' => 'nullable|string',
                'is_available' => 'boolean',
                'is_featured' => 'boolean',
            ]);

            $dataToUpdate = $validated;

            // Por si quieren cambiar la foto
            if ($request->hasFile('image_file')) {
                $subida = $request->file('image_file')->storeOnCloudinary('appifood/products');
                $dataToUpdate['image'] = $subida->getSecurePath();
            }

            $product->update($dataToUpdate);

            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado',
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => (float)$product->price,
                    'discount_price' => $product->discount_price ? (float)$product->discount_price : null,
                    'category_id' => $product->category_id,
                    'image' => $product->image,
                    'is_available' => (bool)$product->is_available,
                    'is_featured' => (bool)$product->is_featured,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar producto
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'restaurant') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $product = Product::findOrFail($id);

            if ($product->restaurant_id !== $user->restaurant->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Producto eliminado',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cambiar disponibilidad de producto
     */
    public function toggleAvailability(int $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'restaurant') {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $product = Product::findOrFail($id);

            if ($product->restaurant_id !== $user->restaurant->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado',
                ], 403);
            }

            $product->is_available = !$product->is_available;
            $product->save();

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado',
                'data' => ['is_available' => (bool)$product->is_available],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
