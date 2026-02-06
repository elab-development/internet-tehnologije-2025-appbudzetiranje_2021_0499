<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    public function definition(): array
    {
        $roles = ['regular', 'premium', 'administrator'];
        $statuses = ['active', 'inactive'];

        return [
            'name' => $this->faker->firstName(),
            'surname' => $this->faker->lastName(),

            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),

            
            'password' => 'password',

            'remember_token' => Str::random(10),

            'role' => $this->faker->randomElement(['regular']),
            'status' => $this->faker->randomElement(['active','inactive']),

            'phone' => $this->faker->optional()->phoneNumber(),
            'bio' => $this->faker->optional()->sentence(),

           
            'image' => $this->faker->optional()->imageUrl(200, 200, 'people'),
        ];
    }

    public function administrator(): static
    {
        return $this->state(fn () => ['role' => 'administrator', 'status' => 'active']);
    }

    public function premium(): static
    {
        return $this->state(fn () => ['role' => 'premium', 'status' => 'active']);
    }

    public function regular(): static
    {
        return $this->state(fn () => ['role' => 'regular', 'status' => 'active']);
    }
}
