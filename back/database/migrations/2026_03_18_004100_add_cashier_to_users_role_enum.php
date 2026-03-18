<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'kitchen', 'cashier') NOT NULL DEFAULT 'kitchen'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'kitchen' WHERE role = 'cashier'");
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'kitchen') NOT NULL DEFAULT 'kitchen'");
    }
};
