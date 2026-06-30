<?php

namespace App\Http\Controllers\API\V1\Products;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponse;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

/**
 * Product Controller V1
 *
 * Maneja operaciones de lectura de productos
 */
class ProductController extends Controller
{
    use ApiResponse;

    /**
     * List All Products
     *
     * @authenticated false
     * @response 200 { "success": true, "data": [...] }
     */
    public function index(): JsonResponse
    {
        try {
            $query = Product::with('restaurant', 'category')
                ->where('is_available', true);

            // Filtro por descuento
            if (request()->boolean('has_discount')) {
                $query->whereNotNull('discount_price')
                    ->whereColumn('discount_price', '<', 'price');
            }

            // Paginación o listado completo
            if (request()->get('paginate') === 'false') {
                $products = $query->get();
            } else {
                $products = $query->paginate(30);
            }

            return $this->success(ProductResource::collection($products), 'Productos obtenidos');
        } catch (\Exception $e) {
            return $this->error('Error al obtener productos: ' . $e->getMessage(), 500);
        }
    }


    /**
     * Get Product Details
     *
     * @authenticated false
     * @param int $id Product ID
     * @response 200 { "success": true, "data": {...} }
     * @response 404 { "success": false, "message": "Producto no encontrado" }
     */
    public function show($id): JsonResponse
    {
        try {
            $product = Product::with('restaurant', 'category', 'reviews')
                ->where('is_available', true)
                ->findOrFail($id);

            return $this->success(new ProductResource($product), 'Producto obtenido');
        } catch (\Exception $e) {
            return $this->error('Producto no encontrado', 404);
        }
    }
}
