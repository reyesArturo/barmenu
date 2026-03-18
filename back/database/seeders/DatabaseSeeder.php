<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Table;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Administradores y Cocineros
        User::create([
            'name' => 'Admin Owner',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'Cocinero',
            'email' => 'cocina@admin.com',
            'password' => Hash::make('password'),
            'role' => 'kitchen'
        ]);

        // Mesas
        $mesas = [
            ['number' => 'Mesa 1', 'qr_token' => 'mesa-1-secret-qr-token'],
            ['number' => 'Mesa 2', 'qr_token' => 'mesa-2-secret-qr-token'],
            ['number' => 'Mesa 3', 'qr_token' => 'mesa-3-secret-qr-token'],
            ['number' => 'Barra', 'qr_token' => 'barra-secret-qr-token'],
        ];

        foreach ($mesas as $mesa) {
            Table::create($mesa);
        }

        // Categorías
        $catTacos = Category::create(['name' => 'Tacos', 'is_active' => true]);
        $catBebidas = Category::create(['name' => 'Bebidas', 'is_active' => true]);
        $catSnacks = Category::create(['name' => 'Snacks', 'is_active' => true]);

        // Productos
        $productos = [
            // Tacos
            ['category_id' => $catTacos->id, 'name' => 'Taco al Pastor', 'description' => 'Tradicional con piña', 'price' => 25.00, 'image_url' => 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400'],
            ['category_id' => $catTacos->id, 'name' => 'Taco de Bistec', 'description' => 'Acompañado de nopales', 'price' => 30.00, 'image_url' => 'https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=400'],
            ['category_id' => $catTacos->id, 'name' => 'Taco Campechano', 'description' => 'Mezcla de pastor y bistec', 'price' => 35.00, 'image_url' => 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400'],
            
            // Bebidas
            ['category_id' => $catBebidas->id, 'name' => 'Cerveza Corona Clara', 'description' => 'Botella 355ml bien fría', 'price' => 45.00, 'image_url' => 'https://images.unsplash.com/photo-1575037614876-c38538029cff?w=400'],
            ['category_id' => $catBebidas->id, 'name' => 'Refresco de Cola', 'description' => 'Lata 355ml', 'price' => 25.00, 'image_url' => 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400'],
            ['category_id' => $catBebidas->id, 'name' => 'Agua de Jamaica', 'description' => 'Litro', 'price' => 35.00, 'image_url' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400'],
            
            // Snacks
            ['category_id' => $catSnacks->id, 'name' => 'Guacamole al centro', 'description' => 'Con totopos', 'price' => 85.00, 'image_url' => 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400'],
            ['category_id' => $catSnacks->id, 'name' => 'Papas Francesas', 'description' => 'Crujientes con sal', 'price' => 50.00, 'image_url' => 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400'],
        ];

        foreach ($productos as $producto) {
            Product::create($producto);
        }
    }
}
