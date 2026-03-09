<?php

namespace App\Jobs;

use App\Mail\AppointmentCancelled;
use App\Models\Appointment;
use App\Models\NotificationLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendAppointmentCancellation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public readonly Appointment $appointment,
    ) {}

    public function handle(): void
    {
        $appointment = $this->appointment->load('client', 'service', 'staff.user');

        $log = NotificationLog::create([
            'user_id' => $appointment->client_id,
            'type'    => 'appointment_cancelled',
            'channel' => 'email',
            'payload' => [
                'appointment_id' => $appointment->id,
                'service'        => $appointment->service->name,
            ],
            'status'  => 'pending',
        ]);

        try {
            Mail::to($appointment->client->email)
                ->send(new AppointmentCancelled($appointment));

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