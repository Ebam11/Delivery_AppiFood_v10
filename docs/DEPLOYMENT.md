# 🚀 Deployment en Railway para AppiFood

## 1. Problemas Solucionados

❌ **Antes:** Configuración de Heroku + nixpacks conflictivos  
✅ **Ahora:** Configuración optimizada para Railway con PHP 8.2

### Cambios Realizados:
- ✅ `Procfile` actualizado: Usa servidor PHP integrado de Railway
- ✅ `nixpacks.toml` mejorado: Extensiones completas + storage:link
- ✅ `.env.railway` creado: Variables de entorno para Railway

---

## 2. Pasos en Railway (Panel Web)

### A. Configurar Base de Datos (MySQL)

1. En el panel de Railway, haz clic en **"+ Create"** → **"Database"** → **MySQL**
2. Espera a que la BD se inicialice (azul)
3. Copia las variables de conexión que Railway te muestra:
   - `RAILWAY_DB_HOST`
   - `RAILWAY_DB_PORT`
   - `RAILWAY_DB_USER`
   - `RAILWAY_DB_PASSWORD`
   - `RAILWAY_DB_DATABASE`

### B. Crear Servicio para el Backend Laravel

1. **"+ Create"** → **"GitHub Repo"** → Selecciona `delivery-appifood`
2. Espera a que Railway detecte el proyecto

### C. Configurar Variables de Entorno

1. En tu servicio del Backend, ve a **"Variables"**
2. Agrega estas variables:

```env
# Generales
APP_NAME=AppiFood
APP_ENV=production
APP_DEBUG=false

# APP_KEY: Ejecuta esto en local y copia el resultado
# php artisan key:generate --show

# URL (cuando tengas dominio asignado)
APP_URL=https://tu-dominio.railway.app

# Base de datos (Railway las inyecta automáticamente)
# Pero por si acaso, cópialas del MySQL service:
DB_CONNECTION=mysql
DB_HOST=${{RAILWAY_DB_HOST}}
DB_PORT=${{RAILWAY_DB_PORT}}
DB_DATABASE=${{RAILWAY_DB_DATABASE}}
DB_USERNAME=${{RAILWAY_DB_USER}}
DB_PASSWORD=${{RAILWAY_DB_PASSWORD}}

# Caché y sesiones
CACHE_DRIVER=array
SESSION_DRIVER=cookie
FILESYSTEM_DISK=public
QUEUE_CONNECTION=sync

# API (opcional, solo si usas estos servicios)
OPENAI_API_KEY=sk_test_api_key
ANTHROPIC_API_KEY=tu_key_aqui

# CORS (restrictivo para producción)
CORS_ALLOWED_ORIGINS=https://appifood-frontend.vercel.app,https://www.appifood.com

# Seguridad
DEBUGBAR_ENABLED=false
TELESCOPE_ENABLED=false
```

### D. Conectar BD al Backend

1. En el panel de Railway, en tu servicio de **MySQL**, ve a **"Plugins"**
2. Busca y conecta a tu servicio de **Backend**
3. Esto inyectará automáticamente las variables `RAILWAY_DB_*`

---

## 3. Verificar Antes de Hacer Push

Antes de hacer push a esta rama, valida localmente:

```bash
# Limpia todo local (simula Railway)
cd Backend
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Intenta levantar el servidor (opcional)
php -S 0.0.0.0:8080 -t public/ public/index.php
```

---

## 4. Hacer Push a la Rama

```bash
cd /c/xampp/htdocs/delivery-appifood

# Commitea los cambios
git add Backend/Procfile Backend/nixpacks.toml Backend/.env.railway
git commit -m "fix: optimize Railway deployment configuration for Laravel Backend"

# Push a develop (o tu rama)
git push origin develop
```

Railway debería detectar los cambios automáticamente y redeployar.

---

## 5. Monitorear el Deploy

1. En tu proyecto de Railway, abre el servicio de **Backend**
2. Ve a **"Deployments"** para ver el historial
3. Haz clic en el deployment más reciente para ver logs en tiempo real
4. Busca errores en la fase de **"Build"** o **"Deploy"**

---

## 6. Si Sigue Fallando

### Problema: "Error al crear plan de compilación"

**Causa:** Probablemente conflicto entre Procfile y nixpacks.toml

**Solución:** Elimina `Procfile` si Railway detecta `nixpacks.toml`
```bash
# Opcional: Si en Railway sigue error, borra Procfile
git rm Backend/Procfile
git commit -m "remove: Procfile no necesario con nixpacks"
git push origin develop
```

### Problema: "Composer install falló"

**Causa:** Dependencia conflictiva o lock file desactualizado

**Solución:**
```bash
cd Backend
composer check-platform-reqs  # Verifica requisitos
composer validate              # Valida composer.json
```

### Problema: "PHP extensions missing"

**Solución:** Verifica que `nixpacks.toml` tenga todas las extensiones:
```toml
nixPkgs = [
  "php82",
  "php82Extensions.pdo",
  "php82Extensions.pdo_mysql",
  "php82Extensions.mbstring",
  "php82Extensions.tokenizer",
  "php82Extensions.xml",
  "php82Extensions.ctype",
  "php82Extensions.json",
  "php82Extensions.bcmath",
  "php82Extensions.fileinfo",
  "php82Extensions.curl",  # Crítica para requests
  "composer"
]
```

---

## 7. Después del Deploy Exitoso

1. Obtén la URL de Railway (ej: `appifood-backend.railway.app`)
2. Actualiza `Frontend/.env` con `VITE_API_URL=https://appifood-backend.railway.app/api`
3. Deploy del Frontend en Vercel o similar

---

## 📝 Notas Importantes

- ⚠️ **Migraciones:** Se ejecutan automáticamente en el `start` command
- ⚠️ **Storage Link:** Se crea automáticamente en fase de build
- ⚠️ **Logs:** Disponibles en Railway → Deployments → Logs
- ⚠️ **Base de datos:** Persiste automáticamente si usas MySQL de Railway

---

## ❓ Variables de Referencia

```env
# Generadas automáticamente por Railway
${{RAILWAY_DB_HOST}}
${{RAILWAY_DB_PORT}}
${{RAILWAY_DB_DATABASE}}
${{RAILWAY_DB_USER}}
${{RAILWAY_DB_PASSWORD}}

# O en nixpacks.toml, úsalas así:
cmd = "php artisan migrate --force && php -S 0.0.0.0:8080 -t public/ public/index.php"
```
