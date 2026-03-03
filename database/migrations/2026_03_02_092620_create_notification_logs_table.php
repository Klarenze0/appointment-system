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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->string('type');                  // appointment_confirmed, reminder_24h, etc.
            $table->string('channel');               // email | sms
            $table->json('payload');                 // what was sent
            $table->string('status')->default('pending'); // pending|sent|failed
            $table->timestampTz('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        DB::statement('CREATE INDEX idx_notification_logs_user_type 
                       ON notification_logs (user_id, type)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
