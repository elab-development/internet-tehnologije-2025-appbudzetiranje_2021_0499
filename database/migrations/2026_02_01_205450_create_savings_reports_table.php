<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('savings_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month'); // 1–12

            $table->text('notes')->nullable();

            // jedan korisnik može imati samo 1 report po mesecu
            $table->unique(['user_id', 'year', 'month'], 'reports_user_year_month_unique');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('savings_reports');
    }
};
