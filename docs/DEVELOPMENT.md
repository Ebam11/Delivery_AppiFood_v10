# 🔍 Guía de Desarrollo y Buenas Prácticas

## Configuración del Ambiente Local

### Backend (Laravel)

```bash
cd Backend

# 1. Instalar dependencias
composer install

# 2. Copiar configuración
cp .env.example .env

# 3. Generar APP_KEY
php artisan key:generate

# 4. Crear base de datos
# (Crear manualmente en phpMyAdmin o usar MySQL client)

# 5. Ejecutar migraciones
php artisan migrate

# 6. Ejecutar seeders (opcional)
php artisan db:seed

# 7. Crear storage link
php artisan storage:link

# 8. Levantar servidor
php artisan serve
```

### Frontend (React)

```bash
cd Frontend

# 1. Instalar dependencias
npm install

# 2. Copiar configuración
cp .env.example .env.local

# 3. Editar .env.local con la URL del backend
# VITE_API_URL=http://localhost:8000/api

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## Convenciones de Código

### Backend (Laravel/PHP)

#### Naming Conventions

```php
// Modelos: PascalCase (singular)
class User {}
class Order {}
class ProductCategory {}

// Migrations: snake_case con timestamp
2024_04_23_create_users_table.php
2024_04_23_create_orders_table.php

// Controllers: PascalCase + Controller suffix
class UserController {}
class OrderController {}
class AdminUserController {}

// Methods: camelCase
public function createOrder() {}
public function updateRestaurantProfile() {}

// Properties: camelCase
private $restaurantId;
protected $userId;

// Constants: UPPER_CASE
const DISCOUNT_PERCENTAGE = 0.10;
const MAX_ITEMS_PER_ORDER = 50;

// Enums: PascalCase (valor)
UserRole::ADMIN
OrderStatus::PENDING
PaymentStatus::COMPLETED
```

#### File Organization

```
Backend/app/Http/Controllers/
├── API/
│   ├── AdminController.php         # Rutas /api/admin/*
│   ├── RestaurantController.php    # Rutas /api/restaurant/*
│   ├── UserController.php          # Rutas /api/user/*
│   ├── AuthController.php          # Rutas /api/auth/*
│   └── SharedController.php        # Rutas públicas
├── Controller.php                  # Base controller
```

#### Code Style

```php
// ✅ BIEN: Usar resources para transformación
public function index(): JsonResource {
    return UserResource::collection(User::all());
}

// ❌ MAL: Retornar modelos directamente
public function index() {
    return User::all();
}

// ✅ BIEN: Usar form requests para validación
public function store(StoreUserRequest $request) {
    User::create($request->validated());
}

// ❌ MAL: Validar inline
public function store(Request $request) {
    $request->validate([...]);
    User::create($request->all());
}

// ✅ BIEN: Usar scopes en modelos
User::active()->whereHas('orders')->get();

// ❌ MAL: Lógica en controlador
$users = User::where('active', true)->where('orders_count', '>', 0)->get();
```

### Frontend (React/JavaScript)

#### Naming Conventions

```javascript
// Componentes: PascalCase
function UserProfile() {}
function ProductCard() {}
function AdminDashboard() {}

// Funciones/Variables: camelCase
const handleAddToCart = () => {}
const fetchRestaurants = async () => {}
let userId = 123;

// Constantes: UPPER_CASE
const API_BASE_URL = 'http://localhost:8000/api';
const MAX_CART_ITEMS = 50;

// Archivos de componentes
ProductCard.jsx
UserProfile.jsx
AdminDashboard.jsx

// Archivos de lógica
cartStore.js
authStore.js
api/orders.js
```

#### File Organization

```
Frontend/src/
├── components/
│   ├── common/          # Componentes reutilizables
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Navbar.jsx
│   ├── product/         # Componentes de producto
│   │   ├── ProductCard.jsx
│   │   ├── ProductModal.jsx
│   │   └── ProductFilter.jsx
│   ├── restaurant/      # Componentes de restaurante
│   │   ├── RestaurantCard.jsx
│   │   └── RestaurantDetail.jsx
│   └── ...
├── pages/
│   ├── auth/            # Autenticación
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── user/            # Usuario
│   │   ├── Profile.jsx
│   │   ├── Orders.jsx
│   │   └── Cart.jsx
│   ├── restaurant/      # Restaurante
│   ├── admin/           # Admin
│   └── ...
├── store/               # Zustand stores
├── api/                 # Axios modules
├── hooks/               # Custom hooks
└── utils/               # Funciones utilitarias
```

#### Code Style

```javascript
// ✅ BIEN: Usar custom hooks
function useAuth() {
    const store = useAuthStore();
    return { user: store.user, isAuth: store.isAuthenticated };
}

// ✅ BIEN: Usar Zustand para estado global
const useCartStore = create((set) => ({
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
}));

// ✅ BIEN: Modularizar llamadas API
export const fetchOrders = async () => {
    const { data } = await api.get('/orders');
    return data;
};

// ❌ MAL: Lógica API en componentes
const [orders, setOrders] = useState([]);
useEffect(() => {
    axios.get('http://localhost:8000/api/orders').then(res => setOrders(res.data));
}, []);

// ✅ BIEN: Usar componentes funcionales con hooks
function MyComponent() {
    const [state, setState] = useState(null);
    useEffect(() => { /* ... */ }, []);
    return <div>{state}</div>;
}

// ❌ MAL: Class components (legacy)
class MyComponent extends React.Component { /* ... */ }
```

---

## Testing

### Backend (PHPUnit)

```bash
# Ejecutar todos los tests
php artisan test

# Ejecutar tests específicos
php artisan test --filter=UserTest
php artisan test tests/Feature/Auth/LoginTest.php

# Con coverage
php artisan test --coverage
```

**Archivos de test:**
```
Backend/tests/
├── Feature/          # Tests de integración
│   ├── Auth/
│   ├── Orders/
│   └── ...
├── Unit/             # Tests unitarios
│   ├── Models/
│   └── ...
└── TestCase.php
```

### Frontend (Jest/Vitest)

```bash
# Ejecutar tests
npm run test

# Con coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Seguridad - Checklist

### Backend

- [ ] `APP_DEBUG=false` en producción
- [ ] `DEBUGBAR_ENABLED=false` en producción
- [ ] `TELESCOPE_ENABLED=false` en producción
- [ ] CORS configurado con dominios específicos (NO `['*']`)
- [ ] HTTPS obligatorio en producción
- [ ] Rate limiting en endpoints críticos
- [ ] Validación en todos los form requests
- [ ] Sanitización de inputs
- [ ] Autorización en todas las rutas (CheckRole, CheckOwner)
- [ ] Passwords hasheados (Bcrypt)
- [ ] API tokens con expiry

### Frontend

- [ ] Validación de inputs en formularios
- [ ] HTTPS en producción
- [ ] CSP headers configurados
- [ ] Secrets NO en código (usar .env)
- [ ] Sanitización de XSS (React lo hace por defecto)
- [ ] CSRF tokens en formularios
- [ ] Autenticación en todas las rutas protegidas

---

## Performance Optimization

### Backend

```php
// ✅ Usar eager loading (evitar N+1 queries)
$orders = Order::with('user', 'items.product')->get();

// ❌ PROBLEMA: N+1 queries
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name;  // Query adicional por cada orden
}

// ✅ Usar selección de columnas
User::select('id', 'name', 'email')->get();

// ✅ Usar indexes en BD
// En migration: $table->index('email');

// ✅ Usar caché para datos estáticos
Cache::remember('restaurants', 3600, function () {
    return Restaurant::all();
});
```

### Frontend

```javascript
// ✅ Lazy loading de rutas
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));

// ✅ Memoización de componentes
const ProductCard = memo(function ProductCard({ product }) {
    return <div>{product.name}</div>;
});

// ✅ useCallback para funciones estables
const handleAddToCart = useCallback((item) => {
    store.addItem(item);
}, []);

// ✅ Debounce en búsquedas
const debouncedSearch = debounce((query) => {
    fetchRestaurants(query);
}, 300);
```

---

## Debugging

### Backend

```bash
# Usar Telescope para debugging (DEV solo)
http://localhost:8000/telescope

# Logs
tail -f Backend/storage/logs/laravel.log

# Debugger (Xdebug + IDE)
# Configurar en .env si es necesario
```

### Frontend

```javascript
// Chrome DevTools
// F12 → Console, Network, Application

// Logs de Zustand
// useAuthStore.subscribe(
//   (state) => console.log('Auth state:', state)
// );
```

---

## Workflow Git

```bash
# 1. Crear rama
git checkout -b feature/nombre-feature

# 2. Hacer cambios
git add .
git commit -m "feat: descripción del cambio"

# 3. Push
git push origin feature/nombre-feature

# 4. Pull request en GitHub
# → Review
# → Merge a develop

# 5. Deploy desde develop a producción
```

**Commit message format:**
```
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato (sin lógica)
refactor: Cambios de estructura (sin funcionalidad)
perf: Mejoras de performance
test: Agregación de tests
chore: Cambios en tooling/dependencias
```

---

## Troubleshooting

### Backend

| Problema | Solución |
|---|---|
| **502 Bad Gateway en Railway** | Verificar logs, revisar `.env` |
| **"Class not found" error** | `composer dump-autoload` |
| **"SQLSTATE[HY000]: General error"** | Verificar BD, ejecutar migraciones |
| **Token expirado en frontend** | Renovar token, implementar refresh token |
| **CORS errors** | Revisar configuración en `config/cors.php` |

### Frontend

| Problema | Solución |
|---|---|
| **"Cannot find module"** | `npm install`, limpiar node_modules |
| **VITE build error** | Revisar `vite.config.js`, version conflicts |
| **API no responde** | Verificar `VITE_API_URL` en `.env.local` |
| **Zustand store no actualiza** | Verificar llamada a `set()` en acciones |
| **Tailwind no funciona** | Ejecutar `npm run build`, revisar `tailwind.config.js` |

