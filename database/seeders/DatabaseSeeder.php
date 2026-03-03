<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::factory()->create([
            'name'     => 'System Admin',
            'email'    => 'admin@appointmentsystem.com',
            'password' => Hash::make('password'),
            'role'     => UserRole::Admin,
        ]);

        // Staff user
        User::factory()->create([
            'name'     => 'Staff Member',
            'email'    => 'staff@appointmentsystem.com',
            'password' => Hash::make('password'),
            'role'     => UserRole::Staff,
        ]);

        // Client user
        User::factory()->create([
            'name'     => 'Test Client',
            'email'    => 'client@appointmentsystem.com',
            'password' => Hash::make('password'),
            'role'     => UserRole::Client,
        ]);
    }
}