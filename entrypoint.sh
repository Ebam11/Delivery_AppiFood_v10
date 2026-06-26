#!/bin/bash
set -e

echo "=== AppiFood Backend Starting ==="

# ── FIX MPM: Eliminar MPMs conflictivos ──
rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf
rm -f /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf
if [ ! -f /etc/apache2/mods-enabled/mpm_prefork.load ]; then
  ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load
  ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf
fi

# ── Configurar el puerto de Apache para Railway ──
if [ -n "$PORT" ]; then
  echo "Configurando Apache en puerto $PORT..."
  sed -i "s/Listen 80/Listen $PORT/g" /etc/apache2/ports.conf
  sed -i "s/:80/:$PORT/g" /etc/apache2/sites-available/*.conf
fi

# ── Limpiar cachés ──
php artisan config:clear 2>/dev/null || true
php artisan route:clear  2>/dev/null || true
php artisan view:clear   2>/dev/null || true

# ── Generar APP_KEY si no existe ──
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --force 2>/dev/null || true
fi

# ── Crear enlace simbólico de storage ──
php artisan storage:link 2>/dev/null || true

# ── Ejecutar migraciones y tasks en background DESPUES de que Apache arranque ──
(
  echo "Esperando que Apache inicie antes de migrar..."
  sleep 8

  echo "Intentando conectar a DB..."
  MAX=10
  for i in $(seq 1 $MAX); do
    if php artisan migrate --force 2>&1; then
      echo "Migraciones OK!"
      break
    fi
    echo "Intento $i/$MAX fallido. Reintentando en 5s..."
    sleep 5
  done

  php artisan config:cache 2>/dev/null || true
  php artisan route:cache  2>/dev/null || true
  echo "Setup completado."
) &

# ── Iniciar Apache INMEDIATAMENTE (Railway ve que responde y no lo mata) ──
echo "Iniciando Apache..."
exec apache2-foreground
