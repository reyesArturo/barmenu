<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Seed roles and permissions for back-office profiles.
     */
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'orders.kitchen.view',
            'orders.status.update',
            'orders.cashier.view',
            'orders.cashier.pay',
            'metrics.view',
            'tables.view',
            'tables.manage',
            'menu.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $kitchenRole = Role::firstOrCreate(['name' => 'kitchen', 'guard_name' => 'web']);
        $cashierRole = Role::firstOrCreate(['name' => 'cashier', 'guard_name' => 'web']);

        $adminRole->syncPermissions($permissions);
        $kitchenRole->syncPermissions([
            'orders.kitchen.view',
            'orders.status.update',
            'tables.view',
        ]);
        $cashierRole->syncPermissions([
            'orders.cashier.view',
            'orders.cashier.pay',
            'tables.view',
        ]);

        User::where('role', 'admin')->get()->each(function (User $user): void {
            $user->assignRole('admin');
        });

        User::where('role', 'kitchen')->get()->each(function (User $user): void {
            $user->assignRole('kitchen');
        });

        User::where('role', 'cashier')->get()->each(function (User $user): void {
            $user->assignRole('cashier');
        });
    }
}
