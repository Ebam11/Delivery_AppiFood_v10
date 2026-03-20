# 🍔 DeliveryApp Frontend (React + Vite)

Frontend separado para la aplicación de delivery, conectado con la API REST de Laravel.

## 📋 Estructura del Proyecto

```
src/
├── api/              # Clientes HTTP para endpoints
│   ├── client.js     # Configuración de Axios
│   ├── auth.js       # Funciones de autenticación
│   └── restaurants.js # Funciones de restaurantes
├── pages/            # Páginas principales
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Restaurants.jsx
│   └── RestaurantDetail.jsx
├── components/       # Componentes reutilizables
│   ├── Header.jsx
│   ├── RestaurantCard.jsx
│   ├── Loading.jsx
│   └── ErrorMessage.jsx
├── store/            # Estado global (Zustand)
│   ├── authStore.js
│   └── restaurantStore.js
├── hooks/            # Hooks personalizados
└── App.jsx           # Componente raíz con routing
```

## 🚀 Inicio Rápido

### 1. Instalar depencias
```bash
cd delivery-app-frontend
npm install
```

### 2. Configurar variables de entorno
Editar `.env.local`:
```
VITE_API_URL=http://localhost:8000/api
VITE_API_BASE=http://localhost:8000
```

### 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

Accesible en `http://localhost:5173/`

## 🔌 Conexión con API Laravel

### Autenticación (Sanctum)
El frontend usa **Laravel Sanctum** para autenticación:
- Los tokens se guardan en `localStorage`
- Se envían automáticamente en el header `Authorization: Bearer {token}`
- Si el token expira (401), redirige a login

### Llamadas a API
Todos los endpoints se hacen a través de `src/api/`:

```javascript
import { getRestaurants, getRestaurantById } from '../api/restaurants';
import { login } from '../api/auth';

// Obtener restaurantes
const restaurants = await getRestaurants();

// Login
const response = await login(email, password);
```

## 📱 Páginas Disponibles

| Página | Ruta | Descripción |
|--------|------|-------------|
| Inicio | `/` | Landing page |
| Login | `/login` | Iniciar sesión |
| Registro | `/register` | Crear cuenta |
| Restaurantes | `/restaurants` | Listado de restaurantes |
| Detalle | `/restaurants/:id` | Detalles y productos de restaurante |

## 🛠️ Stack Tecnológico

- **React 18** - UI Framework
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP Client
- **Zustand** - State management
- **Tailwind CSS** - Styling

## 📝 Notas Importantes

1. **CORS**: Asegúrate que tu API Laravel tenga CORS habilitado para `http://localhost:5173`

2. **API URL**: Por defecto apunta a `http://localhost:8000/api`. Cambia en `.env.local` según necesites

3. **Autenticación**: Usa Sanctum (ya configurado en el backend)

4. **Token Expirado**: Si el token expira, se redirige automáticamente a login

## 🔄 Flujo de Autorización

1. Usuario hace login en `/login`
2. Se recibe token y se guarda en localStorage
3. Token se envía automáticamente en todas las requests
4. Si token expira, se redirige a login y se limpia localStorage

## 📚 Recursos

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vite.dev/)
- [Documentación de React Router](https://reactrouter.com/)
- [Documentación de Zustand](https://github.com/pmndrs/zustand)
- [Documentación de Laravel Sanctum](https://laravel.com/docs/sanctum)

## 🤝 Próximos Pasos

- [ ] Agregar carrito de compras
- [ ] Integrar pagos
- [ ] Chat con restaurantes
- [ ] Tracking de órdenes en tiempo real
- [ ] Notificaciones push
- [ ] Ratings y reseñas
