<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('staff_availabilities');

        Schema::create('staff_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')
                  ->constrained('staff_profiles')
                  ->cascadeOnDelete();
            $table->date('date');         
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        DB::statement('CREATE UNIQUE INDEX idx_staff_availability_unique_date
                       ON staff_availabilities (staff_id, date)
                       WHERE is_active = true');

        DB::statement('CREATE INDEX idx_staff_availability_date
                       ON staff_availabilities (staff_id, date)');
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_availabilities');
    }
};