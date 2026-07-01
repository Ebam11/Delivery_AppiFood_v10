<?php

namespace App\Http\Controllers\API\User;

use App\Support\MediaUrl;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Restaurant;
use App\Models\ShoppingCart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cart = ShoppingCart::with('items.product')
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['data' => null, 'message' => 'Carrito vacío.']);
        }

        return response()->json(['data' => $this->formatCart($cart)]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
            'notes'      => ['nullable', 'string', 'max:200'],
        ], [
            'product_id.required' => 'Debes seleccionar un producto válido.',
            'product_id.exists' => 'El producto seleccionado no existe o no está disponible en este momento.',
            'quantity.required' => 'Debes indicar una cantidad.',
            'quantity.integer' => 'La cantidad debe ser un número entero.',
            'quantity.min' => 'La cantidad mínima es 1.',
        ]);

        $product = Product::findOrFail($request->product_id);

        if (!$product->is_available) {
            return response()->json(['message' => 'Este producto no está disponible.'], 422);
        }

        $restaurant = Restaurant::with('schedules')->find($product->restaurant_id);

        if (!$restaurant || !$this->isRestaurantOpen($restaurant)) {
            return response()->json([
                'message' => 'Este restaurante está cerrado en este momento. No puedes agregar productos al carrito.',
            ], 422);
        }

        $cart = ShoppingCart::firstOrNew(['user_id' => $request->user()->id]);

        // Si el carrito es de otro restaurante, limpiarlo
        if ($cart->exists && $cart->restaurant_id !== $product->restaurant_id) {
            $cart->clear();
            $cart->restaurant_id = $product->restaurant_id;
            $cart->save();
        }

        if (!$cart->exists) {
            $cart->restaurant_id = $product->restaurant_id;
            $cart->save();
        }

        DB::transaction(function () use ($cart, $product, $request) {
            $item = $cart->items()->where('product_id', $product->id)->first();

            if ($item) {
                $item->increment('quantity', $request->quantity);
            } else {
                $cart->items()->create([
                    'product_id' => $product->id,
                    'quantity'   => $request->quantity,
                    'unit_price' => $product->discount_price ?? $product->price,
                    'notes'      => $request->notes,
                ]);
            }
        });

        return response()->json([
            'message' => 'Producto agregado al carrito.',
            'data'    => $this->formatCart($cart->load('items.product')),
        ]);
    }

    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        $request->validate(['quantity' => ['required', 'integer', 'min:0']]);

        $cart = ShoppingCart::where('user_id', $request->user()->id)->firstOrFail();
        $item = CartItem::where('id', $itemId)
            ->where('shopping_cart_id', $cart->id)
            ->firstOrFail();

        if ($request->quantity <= 0) {
            $item->delete();
        } else {
            $item->update(['quantity' => $request->quantity]);
        }

        return response()->json([
            'message' => 'Carrito actualizado.',
            'data'    => $this->formatCart($cart->load('items.product')),
        ]);
    }

    public function removeItem(Request $request, int $itemId): JsonResponse
    {
        $cart = ShoppingCart::where('user_id', $request->user()->id)->firstOrFail();

        CartItem::where('id', $itemId)
            ->where('shopping_cart_id', $cart->id)
            ->firstOrFail()
            ->delete();

        return response()->json([
            'message' => 'Producto eliminado del carrito.',
            'data'    => $this->formatCart($cart->load('items.product')),
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = ShoppingCart::where('user_id', $request->user()->id)->first();
        $cart?->clear();

        return response()->json(['message' => 'Carrito vaciado.']);
    }

    private function isRestaurantOpen(Restaurant $restaurant): bool
    {
        // Si no tiene horarios configurados, asumimos que está abierto
        if (!$restaurant->schedules || $restaurant->schedules->isEmpty()) {
            return true;
        }

        $today = strtolower(now()->englishDayOfWeek);
        $schedule = $restaurant->schedules->firstWhere('day', $today);

        if (!$schedule) {
            return true; // Sin horario para hoy = abierto
        }

        return $schedule->isOpenNow();
    }

    private function formatCart(ShoppingCart $cart): array
    {
        return [
            'restaurant_id' => $cart->restaurant_id,
            'delivery_cost' => (float) ($cart->restaurant->delivery_cost ?? 0),
            'total_items'   => $cart->getTotalItems(),
            'subtotal'      => $cart->getTotal(),
            'total'         => $cart->getTotal(), // Compatible con frontend
            'items'         => $cart->items->map(fn($item) => [
                'id'            => $item->id,
                'product_id'    => $item->product_id,
                'name'          => $item->product->name,
                'product_name'  => $item->product->name, // Compatible con frontend
                'image'         => MediaUrl::resolve($item->product->image),
                'quantity'      => $item->quantity,
                'unit_price'    => $item->unit_price,
                'product_price' => $item->unit_price, // Compatible con frontend
                'subtotal'      => $item->subtotal,
                'total'         => $item->subtotal, // Compatible con frontend
                'notes'         => $item->notes,
            ]),
        ];
    }
}
