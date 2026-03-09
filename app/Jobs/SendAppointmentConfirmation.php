<?php

namespace App\Jobs;

use App\Mail\AppointmentConfirmed;
use App\Models\Appointment;
use App\Models\NotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAppointmentConfirmation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Retry 3 times kapag nag-fail
    public int $tries = 3;

    public function __construct(
        public readonly Appointment $appointment,
    ) {}

    public function handle(): void
    {
        $appointment = $this->appointment->load('client', 'service', 'staff.user');

        // I-log muna bago mag-send
        $log = NotificationLog::create([
            'user_id' => $appointment->client_id,
            'type'    => 'appointment_confirmed',
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
                ->send(new AppointmentConfirmed($appointment));

            // I-update ang log kapag successful
            $log->update([
                'status'  => 'sent',
                'sent_at' => now(),
            ]);

        } catch (\Exception $e) {
            $log->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            // Re-throw para ma-retry ng queue
            throw $e;
        }
    }
}