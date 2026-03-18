FROM php:8.2-fpm

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    nginx

# Instalar extensiones de PHP necesarias para Laravel
RUN docker-php-ext-install pdo_mysql gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar el código del proyecto
WORKDIR /var/www
COPY . .

# Instalar dependencias de Laravel
RUN composer install --no-dev --optimize-autoloader

# Dar permisos a storage
RUN chmod -R 775 storage bootstrap/cache

# Exponer el puerto
EXPOSE 80

# Comando para iniciar (puedes usar un script simple o php artisan serve)
CMD php artisan serve --host=0.0.0.0 --port=$PORT