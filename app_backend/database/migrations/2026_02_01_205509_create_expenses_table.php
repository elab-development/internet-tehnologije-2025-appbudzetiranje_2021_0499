<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();

            $table->foreignId('savings_report_id')
                ->constrained('savings_reports')
                ->cascadeOnDelete();

            $table->decimal('amount', 12, 2);
            $table->char('currency', 3)->default('RSD');

            $table->text('description');
            $table->date('date');

            $table->enum('category', [
                'shopping',
                'food',
                'medicines',
                'sports_and_recreation',
                'entertainment',
                'bills',
            ]);

            $table->enum('payment_method', ['cash', 'card']);

            $table->string('receipt_image')->nullable();

            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_interval', 30)->nullable();

            $table->json('tags')->nullable();

            $table->index(['savings_report_id', 'date']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};

