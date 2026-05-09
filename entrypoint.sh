#!/bin/bash

# Limpiar cachés viejas
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Correr migraciones
echo "Corriendo migraciones..."
php artisan migrate --force

# Iniciar Apache en primer plano
echo "Iniciando Apache..."
apache2-foreground
