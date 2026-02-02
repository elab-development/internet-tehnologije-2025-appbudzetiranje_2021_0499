<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        $categories = [
            'shopping',
            'food',
            'medicines',
            'sports_and_recreation',
            'entertainment',
            'bills',
        ];

        $paymentMethods = ['cash', 'card'];

        $isRecurring = $this->faker->boolean(20); 

        return [
            'savings_report_id' => 1, 

            'amount' => $this->faker->randomFloat(2, 50, 20000),
            'currency' => 'RSD',

            'description' => $this->faker->sentence(6),
            'date' => $this->faker->date(),

            'category' => $this->faker->randomElement($categories),
            'payment_method' => $this->faker->randomElement($paymentMethods),

            'receipt_image' => null,

            'is_recurring' => $isRecurring,
            'recurring_interval' => $isRecurring ? $this->faker->randomElement(['weekly', 'monthly']) : null,

            
            'tags' => $this->faker->boolean(60)
                ? [$this->faker->word(), $this->faker->word()]
                : null,
        ];
    }
}
