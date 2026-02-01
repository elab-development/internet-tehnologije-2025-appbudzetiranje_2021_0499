<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 3 tipa korisnika (za zahtev predmeta)
            $table->enum('role', ['regular', 'administrator', 'premium'])
                ->default('regular')
                ->after('password');

            $table->enum('status', ['active', 'inactive'])
                ->default('active')
                ->after('role');

            // profilna polja
            $table->string('surname')->nullable()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->text('bio')->nullable()->after('phone');
            $table->string('image')->nullable()->after('bio');

            $table->index('role');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['status']);

            $table->dropColumn([
                'role', 'status',
                'surname', 'phone', 'bio', 'image',
            ]);
        });
    }
};

