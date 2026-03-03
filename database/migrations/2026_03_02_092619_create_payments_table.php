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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')
                  ->unique()                     // one payment per appointment
                  ->constrained()
                  ->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('USD');
            $table->string('gateway')->default('simulation'); // stripe|paypal|gcash|simulation
            $table->string('status')->default('pending');
            $table->string('gateway_reference')->nullable();  // external transaction ID
            $table->json('gateway_payload')->nullable();      // raw gateway response
            $table->timestamps();
        });

        DB::statement('CREATE INDEX idx_payments_status ON payments (status)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
