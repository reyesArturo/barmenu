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
        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'kitchen', 'cashier'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'kitchen'");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET NOT NULL");

            return;
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'kitchen', 'cashier') NOT NULL DEFAULT 'kitchen'");

            return;
        }

        throw new RuntimeException("Unsupported database driver for role migration: {$driver}");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE users SET role = 'kitchen' WHERE role = 'cashier'");

        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'kitchen'))");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'kitchen'");
            DB::statement("ALTER TABLE users ALTER COLUMN role SET NOT NULL");

            return;
        }

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'kitchen') NOT NULL DEFAULT 'kitchen'");

            return;
        }

        throw new RuntimeException("Unsupported database driver for role migration: {$driver}");
    }
};
