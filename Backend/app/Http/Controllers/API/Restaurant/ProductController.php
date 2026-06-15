<?php

namespace App\Http\Controllers\API\Restaurant;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::included()->filter()->sort()
            ->where('restaurant_id', $request->user()->restaurant->id)
            ->getOrPaginate();

        return response()->json(
            ProductResource::collection($products)->response()->getData(true)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $product = Product::included()
            ->where('restaurant_id', $request->user()->restaurant->id)
            ->findOrFail($id);

        return response()->json(['data' => new ProductResource($product)]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id'       => ['required', 'exists:categories,id'],
            'name'              => ['required', 'string', 'max:150'],
            'description'       => ['nullable', 'string', 'max:500'],
            'image'             => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'price'             => ['required', 'numeric', 'min:0', 'max:9999999999'],
            'discount_price'    => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'is_available'      => ['boolean'],
            'is_featured'       => ['boolean'],
            'stock'             => ['nullable', 'integer', 'min:0'],
            'prep_time_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
        ]);

        $data = $request->except('image');
        $data['restaurant_id'] = $request->user()->restaurant->id;

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);

        return response()->json([
            'message' => 'Producto creado.',
            'data'    => new ProductResource($product->load('category')),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'category_id'       => ['sometimes', 'exists:categories,id'],
            'name'              => ['sometimes', 'string', 'max:150'],
            'description'       => ['nullable', 'string', 'max:500'],
            'image'             => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'price'             => ['sometimes', 'numeric', 'min:0'],
            'discount_price'    => ['nullable', 'numeric', 'min:0'],
            'is_available'      => ['sometimes', 'boolean'],
            'is_featured'       => ['sometimes', 'boolean'],
            'stock'             => ['nullable', 'integer', 'min:0'],
            'prep_time_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
        ]);

        $product = Product::where('restaurant_id', $request->user()->restaurant->id)
            ->findOrFail($id);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($product->image) Storage::disk('public')->delete($product->image);
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return response()->json([
            'message' => 'Producto actualizado.',
            'data'    => new ProductResource($product->fresh()->load('category')),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $product = Product::where('restaurant_id', $request->user()->restaurant->id)
            ->findOrFail($id);

        if ($product->image) Storage::disk('public')->delete($product->image);
        $product->delete();

        return response()->json(['message' => 'Producto eliminado.']);
    }

    public function toggleAvailability(Request $request, int $id): JsonResponse
    {
        $product = Product::where('restaurant_id', $request->user()->restaurant->id)
            ->findOrFail($id);

        $product->update(['is_available' => !$product->is_available]);

        return response()->json([
            'message'      => $product->is_available ? 'Producto disponible.' : 'Producto no disponible.',
            'is_available' => $product->is_available,
        ]);
    }
}