#!/bin/bash
set -e

# ── FIX MPM: Resolver "More than one MPM loaded" en runtime ──
echo "Configurando Apache MPM..."
rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf
rm -f /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf
# Asegurar que solo prefork está activo
if [ ! -f /etc/apache2/mods-enabled/mpm_prefork.load ]; then
  ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load
  ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf
fi

# ── Limpiar cachés viejas ──
php artisan config:clear
php artisan route:clear
php artisan view:clear

# ── Generar APP_KEY si no existe ──
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force 2>/dev/null || true
fi

# ── Configurar el puerto de Apache para Railway ──
if [ -n "$PORT" ]; then
  echo "Configurando Apache en puerto $PORT..."
  sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
  sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/*.conf
fi

# ── Esperar a que la base de datos esté lista ──
echo "Esperando conexion a la base de datos..."

DB_HOST_VAL="${DB_HOST:-${MYSQLHOST:-127.0.0.1}}"
DB_PORT_VAL="${DB_PORT:-${MYSQLPORT:-3306}}"

MAX_RETRIES=20
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
  if php -r "try { new PDO('mysql:host=${DB_HOST_VAL};port=${DB_PORT_VAL}', '${DB_USERNAME:-${MYSQLUSER:-root}}', '${DB_PASSWORD:-${MYSQLPASSWORD:-}}'); echo 'ok'; exit(0); } catch(Exception \$e) { exit(1); }" 2>/dev/null; then
    echo "Base de datos conectada!"
    break
  fi
  echo "Intento $i/$MAX_RETRIES - DB no responde. Reintentando en ${RETRY_DELAY}s..."
  sleep $RETRY_DELAY
done

# ── Correr migraciones ──
echo "Corriendo migraciones..."
if php artisan migrate --force 2>&1; then
  echo "Migraciones ejecutadas exitosamente!"
else
  echo "Error en migraciones."
fi

# ── Crear enlace simbolico de storage ──
php artisan storage:link 2>/dev/null || true

# ── Optimizar para produccion ──
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true

# ── Verificar config de Apache antes de iniciar ──
echo "Verificando configuracion de Apache..."
apache2ctl configtest 2>&1 || true

# ── Iniciar Apache en primer plano ──
echo "Iniciando Apache..."
exec apache2-foreground
