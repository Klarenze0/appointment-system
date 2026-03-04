<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CalendarService
{

    public function getMonthlyAppointments(int $year, int $month): Collection
    {
        $start = Carbon::create($year, $month, 1)->startOfMonth()->utc();
        $end   = Carbon::create($year, $month, 1)->endOfMonth()->utc();

        return $this->getAppointmentsBetween($start, $end);
    }

    public function getWeeklyAppointments(string $date): Collection
    {
        $start = Carbon::parse($date)->startOfWeek()->utc();
        $end   = Carbon::parse($date)->endOfWeek()->utc();

        return $this->getAppointmentsBetween($start, $end);
    }

    public function getDailyAppointments(string $date): Collection
    {
        $start = Carbon::parse($date)->startOfDay()->utc();
        $end   = Carbon::parse($date)->endOfDay()->utc();

        return $this->getAppointmentsBetween($start, $end);
    }

    private function getAppointmentsBetween(Carbon $start, Carbon $end): Collection
    {
        return Appointment::with(['client', 'staff.user', 'service'])
            ->whereBetween('starts_at', [$start, $end])
            ->orderBy('starts_at')
            ->get()
            ->map(fn ($appt) => $this->formatForCalendar($appt));
    }

    private function formatForCalendar(Appointment $appt): array
    {
        return [
            'id'           => $appt->id,
            'starts_at'    => $appt->starts_at->toIso8601String(),
            'ends_at'      => $appt->ends_at->toIso8601String(),
            'status'       => $appt->status->value,
            'client_name'  => $appt->client->name,
            'staff_name'   => $appt->staff->user->name,
            'service_name' => $appt->service->name,
            'duration'     => $appt->service->duration_minutes,
        ];
    }
}