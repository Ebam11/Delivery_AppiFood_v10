#!/bin/bash

# Limpiar cachés viejas
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Correr migraciones con reintentos para esperar a que la base de datos esté lista
echo "Corriendo migraciones..."
for i in {1..10}; do
  if php artisan migrate --force; then
    echo "¡Migraciones ejecutadas exitosamente!"
    break
  fi
  echo "La base de datos no responde aún. Reintentando en 3 segundos ($i/10)..."
  sleep 3
done

# Iniciar Apache en primer plano
echo "Iniciando Apache..."
apache2-foreground
