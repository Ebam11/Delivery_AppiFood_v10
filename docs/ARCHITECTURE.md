# 📘 Documentación General del Proyecto AppiFood

Este documento consolida la arquitectura técnica, el estado del monorepo y las correcciones de diseño y experiencia de usuario aplicadas sobre **AppiFood** (Backend en Laravel, Frontend en React).

---

## 📐 1. Arquitectura y Estructura General

El monorepo está dividido de la siguiente manera:
```
delivery-appifood/
├── Backend/      → API REST (Laravel 10)
├── Frontend/     → Single Page Application (React 18 + Vite)
├── docs/         → Documentación unificada
└── Config files  → Configuración raíz del monorepo
```

### 🖥️ Backend (Laravel 10 API)
- **Autenticación:** Laravel Sanctum (Tokens API stateless).
- **Autorización:** RBAC (Spatie Laravel Permission) con roles: `admin`, `restaurant`, y `user` (cliente).
- **Modelos Principales:** `User`, `Restaurant`, `Product`, `Order`, `OrderTracking`, `Payment`, `Subscription`, `Review`, `Favorite`, y `Coupon`.
- **Lógica de Estados:** El enum `OrderStatus` maneja de forma centralizada las etapas traducidas al español: `'Pendiente'`, `'Confirmado'`, `'Preparando'`, `'En camino'`, `'Entregado'`, y `'Cancelado'`.

### ⚛️ Frontend (React 18 + Vite)
- **Manejador de Estado:** Zustand (ligero) y React Context.
- **Enrutamiento:** React Router v6 con carga diferida (`React.lazy`) para optimización de bundle.
- **Localización:** `i18next` con soporte multi-idioma.
- **UI:** Tailwind CSS (diseño responsivo y adaptativo).

---

## 🚀 2. Mejoras y Correcciones Recientes

Se han implementado mejoras críticas para optimizar la experiencia de usuario (UX) y el rendimiento del sistema:

### 👤 Acceso Modular (Login & Drawer)
- **Selector de Rol en Login:** Se unificó el inicio de sesión en `/login` mediante pestañas selectoras:
  - **Soy Cliente:** Muestra el inicio de sesión con Google y un enlace de registro para usuarios finales.
  - **Soy Restaurante:** Oculta Google Login y redirige al panel de administración del restaurante con un flujo directo.
- **Menú Lateral Depurado:** Se removió el link "Registra tu restaurante" del Drawer principal y se quitó el botón de redirección de inicio de sesión del encabezado de registro del restaurante, simplificando la interfaz del usuario común.

### 🎨 Carrusel de Categorías & UI
- **Posición de las Flechas:** Las flechas de desplazamiento del carrusel de categorías se movieron a los costados del contenedor (izquierda y derecha), centradas en la mitad vertical de las tarjetas de categorías, imitando la navegación nativa de macOS.
- **Ubicación de Filtros y Estadísticas:** Los contadores rápidos ("Restaurantes" y "Abiertos") en la vista de exploración se reubicaron en la esquina superior derecha, alineados con el título principal.

### ⚙️ Widgets Inteligentes
- **LanguageSwitcher & Chatbot IA:** Se integró lógica de rutas para que el widget del traductor y el chatbot de asistencia flotante se oculten automáticamente en las pantallas de inicio de sesión (`/login`, `/restaurant/login`), registro (`/register`, `/register-restaurant`), recuperación de contraseña (`/forgot-password`) y durante las pantallas de carga iniciales de la aplicación.

---

## 🔒 3. Seguridad y Escalabilidad

1. **Tokens de Sesión:** Las solicitudes HTTP usan interceptores de cabecera en Axios para inyectar automáticamente el token Bearer desde el `localStorage`.
2. **Caché y Background Jobs:** Se propone implementar Redis para caché de menús de restaurantes y colas de Laravel para optimizar el envío de notificaciones automáticas y correos de órdenes.
