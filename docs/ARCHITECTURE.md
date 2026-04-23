# 📐 Arquitectura del Proyecto AppiFood

## Estructura General

AppiFood es una aplicación de entrega de comida construida como un **monorepo** con separación clara entre Backend (Laravel API) y Frontend (React SPA).

```
delivery-appifood/
├── Backend/      → API REST (Laravel 10)
├── Frontend/     → SPA (React 18 + Vite)
├── docs/         → Documentación
└── Config files  → Configuración raíz
```

## Backend (Laravel 10 API)

### Stack Tecnológico
- **Framework:** Laravel 10
- **Autenticación:** Laravel Sanctum
- **Autorización:** Spatie Laravel Permission (RBAC)
- **ORM:** Eloquent
- **Base de datos:** MySQL/PostgreSQL
- **Storage:** Local/S3

### Estructura de Carpetas

```
Backend/app/
├── Enums/           → UserRole, OrderStatus, PaymentStatus, SubscriptionStatus
├── Models/          → 24 modelos (User, Restaurant, Product, Order, etc.)
├── Http/
│   ├── Controllers/ → Organizados por dominio (Admin, Restaurant, User, Auth, Shared)
│   ├── Middleware/  → CheckRole, CheckRestaurantOwner, Authenticate
│   ├── Requests/    → Form requests con validación
│   └── Resources/   → Transformación de respuestas JSON
├── Providers/       → Service providers
├── Console/         → Commands
└── Exceptions/      → Exception handling
```

### Flujo de Autenticación

```
1. Registro/Login → AuthController
2. Laravel Sanctum genera token
3. Token almacenado en cliente (localStorage)
4. Cada request incluye: Authorization: Bearer {token}
5. Middleware verifica token
6. Spatie Permission verifica rol
7. Middleware CheckRestaurantOwner verifica propiedad (si aplica)
```

### Modelos Principales

| Modelo | Relaciones | Propósito |
|---|---|---|
| User | roles, restaurant, orders, addresses | Usuario multirrol |
| Restaurant | categories, products, orders, schedules | Restaurante |
| Product | category, restaurant, cart_items, order_items | Productos |
| Order | items, tracking, payment, notifications | Pedidos |
| OrderTracking | order | Timeline de entrega |
| Category | products, restaurants | Categorías |
| ShoppingCart | items, user | Carrito |
| CartItem | product, cart | Items en carrito |
| Payment | order, method | Pagos |
| Address | user | Direcciones |
| Review | user, restaurant, product | Reseñas |
| Favorite | user, restaurant | Favoritos |
| Coupon | — | Descuentos |
| Subscription | user, plan | Suscripciones |

### API Endpoints

#### Públicos
- `POST /api/auth/register` — Registro de usuarios
- `POST /api/auth/login` — Login
- `POST /api/auth/forgot-password` — Recuperar contraseña
- `GET /api/restaurants` — Listar restaurantes
- `GET /api/restaurants/{id}` — Detalles restaurante
- `GET /api/reviews` — Reseñas públicas

#### Autenticados (middleware: `auth:sanctum`)
- `GET /api/profile` — Perfil del usuario
- `POST /api/upload` — Subir archivos
- `GET /api/notifications` — Notificaciones

#### Usuario (middleware: `role:user`)
- `POST /api/cart/*` — Operaciones de carrito
- `POST /api/orders` — Crear pedidos
- `GET /api/orders` — Mis pedidos
- `POST /api/payments` — Procesar pagos

#### Restaurante (middleware: `role:restaurant`)
- `GET /api/restaurant/dashboard` — Dashboard stats
- `GET /api/restaurant/orders` — Pedidos del restaurante
- `POST /api/restaurant/products` — CRUD productos
- `POST /api/restaurant/categories` — CRUD categorías

#### Admin (middleware: `role:admin`)
- `GET /api/admin/dashboard` — Dashboard global
- `GET /api/admin/users` — Gestión de usuarios
- `GET /api/admin/restaurants` — Gestión de restaurantes
- `GET /api/admin/coupons` — Gestión de cupones

## Frontend (React 18 + Vite)

### Stack Tecnológico
- **Framework:** React 18
- **Build Tool:** Vite
- **State Management:** Zustand
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **Internacionalización:** i18next (9 idiomas)
- **Linter:** ESLint, Stylelint

### Estructura de Carpetas

```
Frontend/src/
├── api/           → Módulos axios (auth.js, cart.js, orders.js, etc.)
├── components/    → Componentes reutilizables (22 componentes)
├── pages/         → Vistas/páginas (25 páginas)
├── store/         → Stores Zustand (authStore, cartStore, etc.)
├── hooks/         → Custom hooks
├── context/       → React Context (CartContext)
├── locales/       → Archivos de traducción i18n
├── assets/        → Imágenes y recursos
├── utils/         → Utilidades y helpers
├── App.jsx        → Router principal
├── main.jsx       → Punto de entrada
├── i18n.js        → Configuración i18next
└── index.css      → Estilos globales
```

### Componentes Principales

| Componente | Propósito |
|---|---|
| Header.jsx | Navegación + Autenticación |
| Footer.jsx | Footer común |
| CartSidebar.jsx | Panel lateral del carrito |
| ProductCard.jsx | Tarjeta de producto |
| RestaurantCard.jsx | Tarjeta de restaurante |
| ProductModal.jsx | Modal de detalles producto |
| PaymentMethodSelector.jsx | Selección método de pago |
| SupportChatbot.jsx | Chat IA integrado |
| LanguageSwitcher.jsx | Cambio de idioma |

### Stores Zustand

- **authStore** — Usuario, token, rol
- **cartStore** — Carrito local
- **orderStore** — Pedidos del usuario
- **restaurantStore** — Datos del restaurante (si es restaurant)
- **paymentStore** — Método de pago seleccionado
- **favoritesStore** — Restaurantes favoritos

### Flujo de Datos

```
1. Componente llama API (modules en src/api/)
2. Axios interceptor añade token
3. Backend procesa y devuelve JSON
4. Zustand store actualiza estado
5. Componente re-renderiza con nuevo estado
6. UI actualizada
```

### Rutas Principales

- `/` — Home (restaurantes)
- `/login` — Login usuario
- `/register` — Registro usuario
- `/restaurant/login` — Login restaurante
- `/restaurant/register` — Registro restaurante
- `/restaurant/dashboard` — Dashboard restaurante
- `/restaurants/{id}` — Detalles restaurante
- `/cart` → `/checkout` — Proceso de compra
- `/orders` — Mis pedidos
- `/profile` — Perfil usuario
- `/admin/dashboard` — Dashboard admin

## Flujo de Datos Completo

```
Frontend (React)
    ↓ [axios POST/GET]
Backend (Laravel API)
    ↓ [Middleware: Auth, Role check]
Models + Database
    ↓ [Eloquent queries]
API Response (JSON)
    ↓ [Response::json]
Frontend (React)
    ↓ [Zustand store update]
Components
    ↓ [useSelector hooks]
UI Rendered
```

## Seguridad

### Implementado
- ✅ **Autenticación:** Laravel Sanctum (tokens API)
- ✅ **Autorización:** Spatie Permission (RBAC)
- ✅ **Rate Limiting:** Middleware
- ✅ **CSRF Protection:** Sanctum CSRF tokens
- ✅ **Password Hashing:** Bcrypt
- ✅ **Token Expiry:** Configurable en Sanctum

### Por Implementar
- 🟡 **CORS restrictivo:** Actualmente abierto (`['*']`) → Debe ser específico
- 🟡 **HTTPS obligatorio:** En producción
- 🟡 **2FA:** Autenticación de dos factores (opcional)
- 🟡 **API Keys:** Para servicios internos
- 🟡 **Rate Limiting:** Más estricto en producción

## Performance

### Optimizaciones Implementadas
- ✅ Vite (build rápido)
- ✅ Tailwind CSS (CSS optimizado)
- ✅ Zustand (estado ligero)
- ✅ React Router lazy loading (code splitting)
- ✅ API modular (cacheable)

### Recomendaciones
- 🟡 Implementar Redis para caché backend
- 🟡 CDN para assets estáticos
- 🟡 Compresión gzip en backend
- 🟡 Lazy loading de imágenes en frontend

## Escalabilidad

### Arquitectura Escalable
- ✅ Separación Backend/Frontend
- ✅ Base de datos normalizada
- ✅ Modelos bien estructurados
- ✅ API REST stateless
- ✅ State management centralizado

### Próximos Pasos
- 🟡 Microservicios (Payments, Delivery, Notifications)
- 🟡 Message Queue (Redis, RabbitMQ)
- 🟡 Background Jobs (Queue)
- 🟡 Real-time (WebSockets)
- 🟡 Caching Layer (Redis)
