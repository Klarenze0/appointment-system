<?php

namespace App\Jobs;

use App\Mail\AppointmentReminder;
use App\Models\Appointment;
use App\Models\NotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAppointmentReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public string $connection = 'database'; 
    
    public function __construct(
        public readonly Appointment $appointment,
    ) {}

    public function handle(): void
    {
        $appointment = $this->appointment->load('client', 'service', 'staff.user');

        // Hindi na mag-send kapag cancelled na
        if ($appointment->status->value === 'cancelled') {
            return;
        }

        $log = NotificationLog::create([
            'user_id' => $appointment->client_id,
            'type'    => 'appointment_reminder',
            'channel' => 'email',
            'payload' => [
                'appointment_id' => $appointment->id,
                'service'        => $appointment->service->name,
                'starts_at'      => $appointment->starts_at->toIso8601String(),
            ],
            'status'  => 'pending',
        ]);

        try {
            Mail::to($appointment->client->email)
                ->send(new AppointmentReminder($appointment));

            $log->update([
                'status'  => 'sent',
                'sent_at' => now(),
            ]);

        } catch (\Exception $e) {
            $log->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}