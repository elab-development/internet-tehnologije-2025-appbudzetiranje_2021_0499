<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;


class UserSeeder extends Seeder
{
    public function run(): void
    {
        
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'surname' => 'User',
                'password' => 'password123',
                'role' => 'administrator',
                'status' => 'active',
                'phone' => null,
                'bio' => null,
                'image' => null,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );


       
        User::factory()->count(15)->create();
    }
}
