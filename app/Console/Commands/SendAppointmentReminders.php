<?php

namespace App\Console\Commands;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendAppointmentReminders extends Command
{
    protected $signature   = 'appointments:send-reminders';
    protected $description = 'Send reminder emails for appointments happening tomorrow';

    public function __construct(
        private readonly NotificationService $notificationService,
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        // Kunin ang lahat ng appointments bukas
        $tomorrow = Carbon::tomorrow()->utc();

        $appointments = Appointment::with(['client', 'service', 'staff.user'])
            ->whereIn('status', [
                AppointmentStatus::Confirmed->value,
                AppointmentStatus::Pending->value,
            ])
            ->whereDate('starts_at', $tomorrow->toDateString())
            ->get();

        $this->info("Found {$appointments->count()} appointments for tomorrow.");

        foreach ($appointments as $appointment) {
            if (! $appointment instanceof Appointment) {
                $this->warn("Skipping non-Appointment object.");
                continue;
            }

            $this->notificationService->sendReminder($appointment);
            $this->line("Reminder queued for appointment #{$appointment->id}");
        }


        $this->info('Done.');
    }
}