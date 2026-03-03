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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')
                  ->constrained('users')
                  ->restrictOnDelete();  // ← RESTRICT, not cascade
            $table->foreignId('staff_id')
                  ->constrained('staff_profiles')
                  ->restrictOnDelete();
            $table->foreignId('service_id')
                  ->constrained()
                  ->restrictOnDelete();
            $table->timestampTz('starts_at');   // ← timestampTz = timestamptz in PG
            $table->timestampTz('ends_at');
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Composite index for overlap detection queries (BookingService will use this)
        DB::statement('CREATE INDEX idx_appointments_overlap_check 
                       ON appointments (staff_id, starts_at, ends_at) 
                       WHERE status NOT IN (\'cancelled\')');

        // Index for client portal: "show my upcoming appointments"
        DB::statement('CREATE INDEX idx_appointments_client_status 
                       ON appointments (client_id, status, starts_at)');

        // Index for calendar rendering (admin daily/weekly view)
        DB::statement('CREATE INDEX idx_appointments_starts_at 
                       ON appointments (starts_at)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
