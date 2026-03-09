<?php

namespace App\Services;

use App\Jobs\SendAppointmentCancellation;
use App\Jobs\SendAppointmentConfirmation;
use App\Jobs\SendAppointmentReminder;
use App\Models\Appointment;

class NotificationService
{
    /**
     * I-dispatch ang confirmation email.
     * Tinatawag pagkatapos mag-process ng payment.
     */
    public function sendConfirmation(Appointment $appointment): void
    {
        SendAppointmentConfirmation::dispatch($appointment);
    }

    /**
     * I-dispatch ang cancellation email.
     * Tinatawag pagkatapos ma-cancel ang appointment.
     */
    public function sendCancellation(Appointment $appointment): void
    {
        SendAppointmentCancellation::dispatch($appointment);
    }

    /**
     * I-dispatch ang reminder email.
     * Tinatawag ng scheduled command — 24hrs bago ang appointment.
     */
    public function sendReminder(Appointment $appointment): void
    {
        SendAppointmentReminder::dispatch($appointment);
    }
}