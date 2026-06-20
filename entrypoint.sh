#!/bin/bash
set -e

# ── Limpiar cachés viejas ──
php artisan config:clear
php artisan route:clear
php artisan view:clear

# ── Generar APP_KEY si no existe ──
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force 2>/dev/null || true
fi

# ── Configurar el puerto de Apache para Railway ──
# Railway asigna un puerto dinámico via $PORT
if [ -n "$PORT" ]; then
  echo "Configurando Apache en puerto $PORT..."
  sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
  sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/*.conf
fi

# ── Esperar a que la base de datos esté lista ──
echo "Esperando conexión a la base de datos..."

# Determinar host y puerto de la DB
DB_HOST_VAL="${DB_HOST:-${MYSQLHOST:-127.0.0.1}}"
DB_PORT_VAL="${DB_PORT:-${MYSQLPORT:-3306}}"

MAX_RETRIES=20
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
  if php artisan db:monitor --databases=mysql 2>/dev/null; then
    echo "✅ Base de datos conectada!"
    break
  fi

  # Fallback: intentar conexión directa con PHP
  if php -r "try { new PDO('mysql:host=${DB_HOST_VAL};port=${DB_PORT_VAL}', '${DB_USERNAME:-${MYSQLUSER:-root}}', '${DB_PASSWORD:-${MYSQLPASSWORD:-}}'); echo 'ok'; } catch(Exception \$e) { exit(1); }" 2>/dev/null; then
    echo "✅ Base de datos conectada (PDO)!"
    break
  fi

  echo "⏳ Intento $i/$MAX_RETRIES - La base de datos no responde. Reintentando en ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

# ── Correr migraciones ──
echo "Corriendo migraciones..."
if php artisan migrate --force 2>&1; then
  echo "✅ ¡Migraciones ejecutadas exitosamente!"
else
  echo "⚠️ Error en migraciones. Intentando con --seed..."
  php artisan migrate --force --seed 2>&1 || echo "❌ Las migraciones fallaron. Revisa las variables de entorno de la base de datos."
fi

# ── Crear enlace simbólico de storage ──
php artisan storage:link 2>/dev/null || true

# ── Optimizar para producción ──
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

# ── Iniciar Apache en primer plano ──
echo "🚀 Iniciando Apache..."
exec apache2-foreground
