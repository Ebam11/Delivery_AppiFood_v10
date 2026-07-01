<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Castear paginate string a booleano si es necesario
        if ($request->has('paginate')) {
            $val = filter_var($request->input('paginate'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            $request->merge(['paginate' => $val ?? false]);
        } else {
            $request->merge(['paginate' => false]);
        }

        if (!$request->filled('sort')) {
            $request->merge(['sort' => 'order']);
        }

        $restaurant = \App\Models\Restaurant::where('user_id', $request->user()->id)->first();
        
        if (!$restaurant) {
            return response()->json([
                'message' => 'No tienes un restaurante asociado a tu cuenta.',
            ], 403);
        }
        
        // Auto-crear categorías básicas por defecto si el restaurante no tiene ninguna
        $exists = Category::where('restaurant_id', $restaurant->id)->exists();
        if (!$exists) {
            $defaultCategories = ['Platos Fuertes', 'Entradas', 'Bebidas', 'Postres'];
            foreach ($defaultCategories as $index => $name) {
                Category::create([
                    'restaurant_id' => $restaurant->id,
                    'name'          => $name,
                    'order'         => $index + 1,
                    'is_active'     => true,
                ]);
            }
        }

        $categories = Category::where('restaurant_id', $restaurant->id)
            ->withCount('products')
            ->included()
            ->filter()
            ->sort()
            ->getOrPaginate();

        return $this->respondCollection($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => ['required', 'string', 'max:100'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $category = Category::create([
            'restaurant_id' => $request->user()->restaurant->id,
            'name'          => $request->name,
            'order'         => $request->order ?? 0,
            'is_active'     => true,
        ]);

        return response()->json([
            'message' => 'Categoría creada.',
            'data'    => $category,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name'      => ['sometimes', 'string', 'max:100'],
            'order'     => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $category = Category::where('id', $id)
            ->where('restaurant_id', $request->user()->restaurant->id)
            ->firstOrFail();

        $category->update($request->only('name', 'order', 'is_active'));

        return response()->json([
            'message' => 'Categoría actualizada.',
            'data'    => $category,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::where('id', $id)
            ->where('restaurant_id', $request->user()->restaurant->id)
            ->firstOrFail();

        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'No puedes eliminar una categoría con productos. Mueve o elimina los productos primero.',
            ], 422);
        }

        $category->delete();
        return response()->json(['message' => 'Categoría eliminada.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'categories'       => ['required', 'array'],
            'categories.*.id'  => ['required', 'exists:categories,id'],
            'categories.*.order' => ['required', 'integer'],
        ]);

        $restaurantId = $request->user()->restaurant->id;

        foreach ($request->categories as $item) {
            Category::where('id', $item['id'])
                ->where('restaurant_id', $restaurantId)
                ->update(['order' => $item['order']]);
        }

        return response()->json(['message' => 'Orden actualizado.']);
    }

    private function respondCollection($result): JsonResponse
    {
        if ($result instanceof Paginator) {
            return response()->json($result);
        }

        return response()->json(['data' => $result]);
    }
}
