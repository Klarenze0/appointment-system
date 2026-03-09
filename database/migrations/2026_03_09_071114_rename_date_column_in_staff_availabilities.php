<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('staff_availabilities', function (Blueprint $table) {
            $table->renameColumn('date', 'available_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff_availabilities', function (Blueprint $table) {
            $table->renameColumn('available_date', 'date');
        });
    }
};
