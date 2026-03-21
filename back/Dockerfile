FROM php:8.2-fpm

# Instalar dependencias del sistema (Agregamos libpq-dev para Postgres)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    nginx

# Instalar extensiones de PHP (Ahora con el driver correcto)
RUN docker-php-ext-install pdo_pgsql gd

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar el código del proyecto
WORKDIR /var/www
COPY . .

# Instalar dependencias de Laravel
RUN composer install --no-dev --optimize-autoloader

# Ajustar dueños y permisos (Importante para evitar el Error 500)
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
RUN chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Exponer el puerto
EXPOSE 80

# Comando para iniciar usando la variable de puerto de Render
CMD php artisan serve --host=0.0.0.0 --port=$PORT