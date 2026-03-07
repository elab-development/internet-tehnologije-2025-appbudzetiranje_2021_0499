#!/bin/bash
set -e

cd /var/www

if [ ! -d "vendor" ]; then
  composer install --no-interaction
fi

php artisan key:generate --force || true
php artisan migrate --force || true

php artisan config:cache || true
php artisan route:cache || true

php-fpm -D
nginx -g "daemon off;"