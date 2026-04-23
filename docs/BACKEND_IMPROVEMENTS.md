# 🔧 Recomendaciones de Refactorización - Backend

## Estado Actual

El Backend tiene una buena arquitectura pero puede mejorarse sin romper el código.

**Score Actual:** 7/10

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. Controllers Vacíos (URGENTE - Bloquean Producción)

Estos controllers necesitan implementación antes de producción:

**Ubicación:** `Backend/app/Http/Controllers/API/Admin/`

| Controller | Métodos | Impacto | Prioridad |
|-----------|---------|--------|----------|
| OrderMonitorController.php | index(), show() | Admin no puede ver pedidos | 🔴 CRÍTICO |
| ReportController.php | sales(), restaurants(), users() | Sin reportes admin | 🔴 CRÍTICO |
| BannerController.php | CRUD completo | Sin banners en app | 🟠 ALTA |
| SubscriptionPlanController.php | CRUD completo | Sin suscripciones | 🟠 ALTA |

**Solución:**

1. **OrderMonitorController.php**
```php
// Backend/app/Http/Controllers/API/Admin/OrderMonitorController.php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;

class OrderMonitorController extends Controller
{
    /**
     * Listar todos los pedidos (Admin monitoring)
     * GET /api/admin/orders?status=pending&restaurant_id=1
     */
    public function index()
    {
        $orders = Order::with(['user', 'restaurant', 'items'])
            ->when(request('status'), fn($q) => $q->where('status', request('status')))
            ->when(request('restaurant_id'), fn($q) => $q->where('restaurant_id', request('restaurant_id')))
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return $this->success($orders, 'Pedidos obtenidos');
    }

    /**
     * Ver detalles de un pedido específico
     * GET /api/admin/orders/{id}
     */
    public function show($id)
    {
        $order = Order::with([
            'user',
            'restaurant',
            'items.product',
            'tracking',
            'payment',
            'review'
        ])->findOr404($id);

        return $this->success($order, 'Pedido obtenido');
    }
}
```

2. **ReportController.php**
```php
class ReportController extends Controller
{
    /**
     * Reporte de ventas
     * GET /api/admin/reports/sales?start=2024-01-01&end=2024-12-31
     */
    public function sales()
    {
        $start = request('start', now()->firstDayOfMonth());
        $end = request('end', now()->lastDayOfMonth());

        $sales = Order::whereBetween('created_at', [$start, $end])
            ->where('status', 'completed')
            ->sum('total');

        $orders = Order::whereBetween('created_at', [$start, $end])
            ->count();

        return $this->success([
            'total_sales' => $sales,
            'total_orders' => $orders,
            'average_order' => $orders > 0 ? $sales / $orders : 0,
            'period' => ['start' => $start, 'end' => $end]
        ]);
    }

    /**
     * Reporte de restaurantes
     */
    public function restaurants()
    {
        $restaurants = Restaurant::with('orders')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->orderByDesc('orders_sum_total')
            ->paginate(10);

        return $this->success($restaurants);
    }

    /**
     * Reporte de usuarios
     */
    public function users()
    {
        $users = User::with('orders')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->where('role', 'user')
            ->orderByDesc('orders_count')
            ->paginate(10);

        return $this->success($users);
    }
}
```

---

### 2. Lógica Compleja en Controllers (ALTO)

**OrderController::store()** - Transacción con múltiples responsabilidades

**Ubicación:** [Backend/app/Http/Controllers/API/User/OrderController.php](Backend/app/Http/Controllers/API/User/OrderController.php) línea 44-157

**Problema:** 113 líneas de lógica de negocio en un controller

**Solución:** Crear OrderService

```php
// Backend/app/Services/OrderService.php

namespace App\Services;

use App\Models\Order;
use App\Models\Coupon;
use App\Models\ShoppingCart;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Crear pedido desde carrito
     *
     * @param User $user
     * @param array $data (address_id, coupon_code, payment_method_id)
     * @return Order
     * @throws Exception
     */
    public function createOrder($user, array $data)
    {
        return DB::transaction(function () use ($user, $data) {
            // 1. Validar carrito
            $cart = ShoppingCart::where('user_id', $user->id)->first();
            if (!$cart || $cart->items->isEmpty()) {
                throw new \Exception('Carrito vacío');
            }

            // 2. Validar restaurante
            $restaurant = $cart->restaurant;
            if (!$restaurant->is_open) {
                throw new \Exception('Restaurante cerrado');
            }

            // 3. Calcular totales
            $totals = $this->calculateTotals($cart, $data['coupon_code'] ?? null);

            // 4. Crear pedido
            $order = Order::create([
                'user_id' => $user->id,
                'restaurant_id' => $restaurant->id,
                'coupon_id' => $totals['coupon']?->id,
                'subtotal' => $totals['subtotal'],
                'discount' => $totals['discount'],
                'tax' => $totals['tax'],
                'total' => $totals['total'],
                'address_id' => $data['address_id'],
                'status' => 'pending'
            ]);

            // 5. Crear items del pedido
            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->final_price
                ]);
            }

            // 6. Limpiar carrito
            $cart->items()->delete();

            // 7. Registrar tracking
            $order->tracking()->create([
                'status' => 'pending',
                'description' => 'Pedido creado'
            ]);

            return $order;
        });
    }

    /**
     * Calcular totales con descuentos
     */
    private function calculateTotals($cart, $couponCode = null)
    {
        $subtotal = $cart->getTotal();
        $coupon = null;
        $discount = 0;

        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)
                ->where('is_active', true)
                ->first();

            if ($coupon && $coupon->isValid()) {
                $discount = $coupon->type === 'percentage'
                    ? ($subtotal * $coupon->value / 100)
                    : $coupon->value;
            }
        }

        $tax = ($subtotal - $discount) * 0.19; // 19% IVA (ajustar según país)
        $total = $subtotal - $discount + $tax;

        return [
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $total,
            'coupon' => $coupon
        ];
    }
}

// Uso en Controller
class OrderController extends Controller
{
    public function store(StoreOrderRequest $request, OrderService $orderService)
    {
        try {
            $order = $orderService->createOrder(auth()->user(), $request->validated());
            return $this->created($order, 'Pedido creado');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
```

---

### 3. Form Requests Faltantes (ALTO)

Muchos controllers validan inline. Crear Form Requests:

**Ubicación donde ir:** `Backend/app/Http/Requests/`

**Requests Necesarios:**

1. **OrderRequest.php**
```php
namespace App\Http\Requests;

class StoreOrderRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check() && auth()->user()->role === 'user';
    }

    public function rules()
    {
        return [
            'address_id' => 'required|exists:addresses,id,user_id,' . auth()->id(),
            'coupon_code' => 'nullable|string|exists:coupons,code',
            'payment_method_id' => 'required|exists:payment_methods,id,user_id,' . auth()->id(),
        ];
    }

    public function messages()
    {
        return [
            'address_id.required' => 'Dirección requerida',
            'address_id.exists' => 'Dirección no válida',
            'coupon_code.exists' => 'Cupón no válido',
        ];
    }
}
```

2. **ProductRequest.php**
```php
class StoreProductRequest extends FormRequest
{
    public function authorize()
    {
        return auth()->check() && 
               auth()->user()->role === 'restaurant' &&
               auth()->user()->restaurant_id === request('restaurant_id');
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0.01',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|max:2048',
            'is_available' => 'boolean',
        ];
    }
}
```

---

## 🟠 PROBLEMAS ALTOS

### 4. Duplicidad de Scopes en Modelos

**Problema:** Todos los modelos query-ables repiten:
- `scopeIncluded()` - carga relaciones
- `scopeFilter()` - filtra campos
- `scopeSort()` - ordena
- `scopeGetOrPaginate()` - pagina o obtiene

**Solución:** Ya creado el Trait `Queryable` en `Backend/app/Traits/Queryable.php`

**Implementación en Modelos:**

```php
// Backend/app/Models/Product.php
namespace App\Models;

use App\Traits\Queryable;

class Product extends Model
{
    use Queryable;

    // Configurar qué se permite
    protected array $allowedIncludes = ['category', 'restaurant', 'reviews'];
    protected array $allowedFilters = ['name', 'category_id', 'restaurant_id', 'price'];
    protected array $allowedSorts = ['name', 'price', 'created_at', 'rating'];

    // ... resto del modelo
}

// Uso:
Product::included()
    ->filter()   // ?name~Burger&price<50000
    .sort()      // ?sort=price,-created_at
    .getOrPaginate();
```

Aplicar a: Product, Restaurant, Category, User, Order, Review

---

### 5. Sin Documentación (ALTO)

**Problema:** Controllers, Models, y Rutas sin DocBlocks

**Solución:** Agregar documentación

```php
// Backend/app/Http/Controllers/API/User/OrderController.php

namespace App\Http\Controllers\API\User;

use App\Http\Controllers\Controller;
use App\Models\Order;

/**
 * OrderController
 *
 * Gestiona operaciones de pedidos del usuario
 * Rutas base: /api/orders (con middleware role:user)
 */
class OrderController extends Controller
{
    /**
     * Listar pedidos del usuario autenticado
     *
     * @OA\Get(
     *     path="/api/orders",
     *     summary="Listar mis pedidos",
     *     tags={"Orders"},
     *     @OA\Response(response=200, description="Lista de pedidos")
     * )
     */
    public function index()
    {
        $orders = auth()->user()
            ->orders()
            ->with(['restaurant', 'items', 'tracking'])
            ->latest()
            ->paginate();

        return $this->success($orders);
    }

    /**
     * Ver detalles de un pedido específico
     *
     * @param Order $order
     * @return JsonResponse
     */
    public function show(Order $order)
    {
        // Policy: Solo el dueño del pedido puede verlo
        $this->authorize('view', $order);

        return $this->success($order->load(['items', 'tracking', 'payment']));
    }
}
```

---

### 6. Rate Limiting Incompleto

**Problema:** Solo /support/chat tiene throttle

**Solución:** Ya agregado en rutas. Validar que se aplique a:
- ✅ Login (throttle:5,1)
- ✅ Register (throttle:5,1)
- ✅ Password reset (throttle:3,1)
- 🟡 Agregar a: POST /payments (throttle:10,1)
- 🟡 Agregar a: POST /upload (throttle:30,1)

---

## 🟡 PROBLEMAS MEDIOS

### 7. Inconsistencia en Nombres

**Problema:**
- `Restaurant` tiene relación `owner()` (debería ser `user()`)
- Controllers: `OrderManagementController` vs `OrderController`

**Solución:**

```php
// Backend/app/Models/Restaurant.php

// ✗ Actual
public function owner(): BelongsTo
{
    return $this->belongsTo(User::class, 'user_id');
}

// ✓ Recomendado
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'user_id');
}

// Backward compatibility
public function owner()
{
    return $this->user();
}
```

Consistencia en Controllers: No usar "Management" suffix

---

### 8. Validación de Seguridad

**Problema:**
- DELETE `/users/{id}` sin verificar si es el usuario mismo
- UPDATE `/restaurants/{id}` sin verificar propiedad completa

**Solución:** Crear Policies

```php
// Backend/app/Policies/OrderPolicy.php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->user_id ||
               $user->id === $order->restaurant->user_id ||
               $user->role === 'admin';
    }

    public function update(User $user, Order $order): bool
    {
        return $user->role === 'admin' ||
               ($user->role === 'restaurant' && $user->id === $order->restaurant->user_id);
    }
}

// Registro en AuthServiceProvider
Gate::policy(Order::class, OrderPolicy::class);

// Uso en Controller
$this->authorize('view', $order);
$this->authorize('update', $order);
```

---

## ✅ YA IMPLEMENTADO

✅ **CORS mejorado** - Configurado con env variables
✅ **Rate limiting en auth** - throttle:5,1
✅ **ApiResponse Trait** - Respuestas JSON consistentes
✅ **Queryable Trait** - Scopes reutilizables
✅ **Base Controller** - Con ApiResponse y Validation

---

## 📋 ACCIONES RECOMENDADAS POR PRIORIDAD

### FASE 1 - URGENTE (Antes de producción)

**Semana 1:**
- [ ] Implementar OrderMonitorController
- [ ] Implementar ReportController
- [ ] Crear Form Requests: OrderRequest, ProductRequest, PaymentRequest
- [ ] Agregar Queryable Trait a Product, Restaurant, Category, User

**Semana 2:**
- [ ] Extraer lógica OrderController::store() a OrderService
- [ ] Implementar BannerController
- [ ] Implementar SubscriptionPlanController
- [ ] Crear Policies para Order, Restaurant, User

### FASE 2 - IMPORTANTE (Post-lanzamiento)

**Semana 3-4:**
- [ ] Agregar DocBlocks a todos los controllers
- [ ] Crear CartService (centralizar lógica de carrito)
- [ ] Crear FileUploadService (manejo uniforme de uploads)
- [ ] Crear DashboardService (stats para admin y restaurant)

### FASE 3 - NICE TO HAVE

- [ ] Generar API documentation (OpenAPI/Swagger)
- [ ] Crear tests (PHPUnit) para controllers
- [ ] Implementar validación adicional (custom rules)
- [ ] Agregar logging detallado

---

## 🔐 SECURITY CHECKLIST

Antes de PRODUCCIÓN:

- [ ] `.env` con variables seguras (no en Git)
- [ ] `APP_DEBUG=false`
- [ ] `DEBUGBAR_ENABLED=false`
- [ ] `TELESCOPE_ENABLED=false`
- [ ] CORS configurado con dominios específicos
- [ ] HTTPS obligatorio
- [ ] Rate limiting en endpoints sensibles
- [ ] Validación en todos los inputs
- [ ] Sanitización de datos
- [ ] Password hashing (Bcrypt)
- [ ] JWT/Token expiry configurado
- [ ] Permissions verificadas en todas las rutas

---

## 📚 Estructura Recomendada Final

```
Backend/app/
├── Console/          ✓
├── Enums/            ✓
├── Events/           (considerar para notifications)
├── Exceptions/       ✓
├── Http/
│   ├── Controllers/  ✓ (Divididos por dominio)
│   ├── Middleware/   ✓
│   ├── Requests/     (Agregar más)
│   └── Resources/    ✓
├── Jobs/             (considerar para background tasks)
├── Listeners/        (considerar para eventos)
├── Mail/             (considerar para emails)
├── Models/           ✓
├── Notifications/    (considerar para notificaciones)
├── Policies/         (CREAR - Autorización)
├── Providers/        ✓
├── Services/         (CREAR - Lógica de negocio)
├── Traits/           ✓ (Queryable, ApiResponse)
└── Observers/        (considerar para auditoría)
```

---

## 🎯 Métricas de Éxito

Después de implementar estas mejoras:

- ✓ 0 controllers vacíos
- ✓ Todos los models con Queryable
- ✓ Todos los endpoints con Form Requests
- ✓ 100% de controllers con DocBlocks
- ✓ Lógica de negocio en Services (no en Controllers)
- ✓ Score de arquitectura: 9/10

---

## 📝 Referencia

- Laravel Best Practices: https://laravel.com/docs/10/controllers
- Spatie Permission: https://spatie.be/docs/laravel-permission
- API Design: https://restfulapi.net/
- Security: https://laravel.com/docs/10/security

