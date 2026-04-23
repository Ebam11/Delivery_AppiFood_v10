# AppiFood - Aplicación de Entrega de Comida

## 📋 Descripción General

AppiFood es una plataforma completa de entrega de comida construida con:

- **Backend:** Laravel 10 API REST
- **Frontend:** React 18 + Vite
- **Arquitectura:** Monorepo con separación clear Backend/Frontend

El proyecto soporta múltiples roles de usuario (Cliente, Restaurante, Admin) con autenticación segura y funcionalidades completas de e-commerce.

---

## 🚀 Inicio Rápido

### Requisitos Previos

- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer
- npm

### Setup Local (5 minutos)

#### 1. Backend

```bash
cd Backend

# Instalar dependencias
composer install

# Configurar ambiente
cp .env.example .env
php artisan key:generate

# Base de datos
# Crear DB manualmente: CREATE DATABASE appifood;
php artisan migrate
php artisan storage:link

# Iniciar servidor
php artisan serve  # http://localhost:8000
```

#### 2. Frontend

```bash
cd Frontend

# Instalar dependencias
npm install

# Configurar ambiente
cp .env.example .env.local
# Editar .env.local: VITE_API_URL=http://localhost:8000/api

# Iniciar dev server
npm run dev  # http://localhost:5173
```

---

## 📁 Estructura del Proyecto

```
delivery-appifood/
├── Backend/                    # Laravel 10 API
│   ├── app/
│   │   ├── Http/Controllers/  # Controladores por dominio
│   │   ├── Models/            # 24 modelos Eloquent
│   │   ├── Enums/             # Roles y estados
│   │   └── Exceptions/        # Manejo de errores
│   ├── routes/api.php         # Rutas API REST
│   ├── config/                # Configuración (CORS, auth, etc)
│   ├── database/              # Migraciones y seeders
│   └── storage/               # Uploads, logs, caché
│
├── Frontend/                   # React 18 + Vite
│   ├── src/
│   │   ├── components/        # 22 componentes reutilizables
│   │   ├── pages/             # 25 páginas/vistas
│   │   ├── store/             # 6 stores Zustand
│   │   ├── api/               # Módulos Axios
│   │   ├── locales/           # Traducciones i18n
│   │   └── App.jsx            # Router principal
│   ├── public/                # Assets estáticos
│   └── vite.config.js         # Configuración Vite
│
├── docs/                       # Documentación
│   ├── ARCHITECTURE.md        # Arquitectura del proyecto
│   ├── DEPLOYMENT.md          # Guía de deployment
│   ├── DEVELOPMENT.md         # Guía de desarrollo
│   └── README.md              # Este archivo
│
├── TODO.md                    # Roadmap del proyecto
└── [Otros archivos raíz]
```

---

## 🔑 Características Principales

### ✅ Implementadas

- **Autenticación Multirrol**
  - Login/Registro (Cliente, Restaurante, Admin)
  - JWT Tokens (Laravel Sanctum)
  - Role-Based Access Control (RBAC)

- **Funcionalidad Cliente**
  - Explorar restaurantes con filtros
  - Buscar productos
  - Agregar a carrito y checkout
  - Realizar pedidos
  - Seguimiento de entrega (real-time)
  - Sistema de reseñas y calificaciones
  - Favoritos

- **Panel Restaurante**
  - Dashboard con estadísticas
  - Gestión de productos y categorías
  - Pedidos en tiempo real
  - Cambiar estado de pedido
  - Historial de ventas

- **Panel Admin**
  - Dashboard global
  - Gestión de usuarios, restaurantes
  - Gestión de cupones y descuentos
  - Reportes y análisis
  - Control de permisos

- **Internacionalización**
  - 9 idiomas soportados
  - Cambio dinámico de idioma
  - Traducciones completas

- **Integraciones**
  - Pagos (PayU, Mercado Pago)
  - Chat soporte con IA
  - Notificaciones en tiempo real

### 🟡 Por Implementar

- [ ] Tests automatizados (PHPUnit, Jest)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] WebSockets (actualizaciones real-time)
- [ ] Microservicios (Payments, Delivery)

---

## 🔒 Seguridad

### ✅ Implementado

- Autenticación Sanctum (tokens API)
- RBAC con Spatie Permission
- Validación en form requests
- Autorización en endpoints
- CSRF protection
- Password hashing (Bcrypt)

### ⚠️ Importante

**ANTES DE PRODUCCIÓN:**
```bash
# Backend/.env
APP_DEBUG=false
DEBUGBAR_ENABLED=false
TELESCOPE_ENABLED=false
CORS_ALLOWED_ORIGINS=https://app.example.com,https://www.example.com
```

---

## 📊 Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| Laravel | 10.x | Framework web |
| Sanctum | 3.3 | Autenticación API |
| Spatie Permission | 6.24 | RBAC |
| MySQL | 8.0+ | Base de datos |
| Intervention Image | 3.11 | Procesamiento imágenes |

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.3 | Framework UI |
| React Router | 6.26 | Enrutamiento |
| Zustand | 5.0 | State management |
| Axios | 1.6 | HTTP client |
| Tailwind CSS | 3.4 | Styling |
| i18next | 26.0 | Internacionalización |

---

## 📖 Documentación

Accede a la documentación completa en `docs/`:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Arquitectura del proyecto
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Guía de desarrollo y buenas prácticas
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — Guía de deployment en Railway

---

## 🛠️ Comandos Útiles

### Backend

```bash
cd Backend

# Desarrollo
php artisan serve                    # Levantar servidor
php artisan tinker                   # REPL interactivo

# Base de datos
php artisan migrate                  # Ejecutar migraciones
php artisan migrate:rollback         # Revertir última migración
php artisan db:seed                  # Ejecutar seeders
php artisan db:seed --class=UserSeeder

# Caché y configuración
php artisan cache:clear              # Limpiar caché
php artisan config:clear             # Limpiar config
php artisan config:cache             # Cachear config (PROD)

# Testing
php artisan test                     # Ejecutar tests
php artisan test --filter=UserTest

# Producción
php artisan key:generate             # Generar APP_KEY
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend

```bash
cd Frontend

# Desarrollo
npm run dev                          # Levantar dev server
npm run build                        # Build para producción
npm run preview                      # Preview build

# Linting
npm run lint                         # ESLint
npm run format                       # Prettier (si está configurado)

# Testing
npm run test                         # Ejecutar tests
npm run test:coverage                # Coverage report
```

---

## 🔄 Flujo de Trabajo Git

```bash
# Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "feat: descripción del cambio"

# Push
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# → Review → Merge a develop

# Deploy desde develop a producción
```

**Formato de commits:**
```
feat:   Nueva funcionalidad
fix:    Corrección de bug
docs:   Cambios en documentación
refactor: Cambios de estructura
perf:   Mejoras de performance
test:   Agregar tests
chore:  Cambios en tooling
```

---

## 🚀 Deployment

### Railway

AppiFood está configurado para deployment en Railway:

```bash
# 1. Crear cuenta en Railway
# 2. Conectar repositorio GitHub
# 3. Configurar variables de entorno
# 4. Deploy automático en cada push a develop

# Ver: docs/DEPLOYMENT.md
```

### Frontend (Vercel, Netlify, etc.)

```bash
npm run build
# Deploy la carpeta dist/
```

---

## 📞 Soporte

Si encuentras issues:

1. Revisa los logs en `Backend/storage/logs/`
2. Consulta la documentación en `docs/`
3. Ejecuta `php artisan tinker` para debugging
4. Abre un issue en GitHub

---

## 📝 Licencia

Propietario — AppiFood

---

## 👥 Equipo

- **Desarrollo:** Feli
- **Última actualización:** Abril 2026

