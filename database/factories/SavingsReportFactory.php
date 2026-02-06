<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\SavingsReport>
 */
class SavingsReportFactory extends Factory
{
    public function definition(): array
    {
        $year = (int) now()->format('Y');
        $month = (int) now()->format('n');

        return [
            'user_id' => 1, 
            'year' => $year,
            'month' => $month,
            'notes' => $this->faker->optional()->sentence(10),
        ];
    }
}
