<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\StaffProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(
        private readonly AvailabilityService $availabilityService,
    ) {}


    public function book(User $client, array $data): Appointment
    {
        $service = Service::findOrFail($data['service_id']);
        $staff   = StaffProfile::findOrFail($data['staff_id']);

        $startsAt = Carbon::parse($data['starts_at'])->utc();
        $endsAt   = $startsAt->copy()->addMinutes($service->duration_minutes);

        return DB::transaction(function () use ($client, $service, $staff, $startsAt, $endsAt) {

            DB::select("
                SELECT id FROM appointments
                WHERE staff_id = ?
                  AND status NOT IN ('cancelled', 'no_show')
                  AND starts_at < ?
                  AND ends_at   > ?
                FOR UPDATE
            ", [
                $staff->id,
                $endsAt->toDateTimeString(),
                $startsAt->toDateTimeString(),
            ]);

            $hasOverlap = Appointment::where('staff_id', $staff->id)
                ->whereNotIn('status', [
                    AppointmentStatus::Cancelled->value,
                    AppointmentStatus::NoShow->value,
                ])
                ->where('starts_at', '<', $endsAt)
                ->where('ends_at',   '>', $startsAt)
                ->exists();

            if ($hasOverlap) {
                throw new \RuntimeException(
                    'This time slot is no longer available. Please choose another time.'
                );
            }

            $isAvailable = $this->availabilityService
                ->isStaffAvailable($staff, $startsAt, $endsAt);

            if (! $isAvailable) {
                throw new \RuntimeException(
                    'The selected staff is not available at this time.'
                );
            }

            $isAssigned = $staff->services()
                ->where('services.id', $service->id)
                ->exists();

            if (! $isAssigned) {
                throw new \RuntimeException(
                    'This staff member does not offer the selected service.'
                );
            }

            return Appointment::create([
                'client_id'  => $client->id,
                'staff_id'   => $staff->id,
                'service_id' => $service->id,
                'starts_at'  => $startsAt,
                'ends_at'    => $endsAt,
                'status'     => AppointmentStatus::Pending,
                'notes'      => null,
            ]);
        });
    }

    public function cancel(Appointment $appointment): Appointment
    {
        if (! $appointment->status->isCancellable()) {
            throw new \RuntimeException(
                'This appointment can no longer be cancelled.'
            );
        }

        $appointment->update([
            'status' => AppointmentStatus::Cancelled,
        ]);

        return $appointment->fresh();
    }

    public function reschedule(Appointment $appointment, string $newStartsAt): Appointment
    {
        if (! $appointment->status->isReschedulable()) {
            throw new \RuntimeException(
                'This appointment can no longer be rescheduled.'
            );
        }

        return DB::transaction(function () use ($appointment, $newStartsAt) {
            $appointment->update(['status' => AppointmentStatus::Cancelled]);

            return $this->book($appointment->client, [
                'service_id' => $appointment->service_id,
                'staff_id'   => $appointment->staff_id,
                'starts_at'  => $newStartsAt,
            ]);
        });
    }

    public function getAvailableSlots(
        StaffProfile $staff,
        Service $service,
        string $date
    ): array {
        $requestedDate = Carbon::parse($date)->utc();
        $dayOfWeek     = $requestedDate->dayOfWeek;

        $availability = $staff->availabilities()
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (! $availability) {
            return [];
        }

        $slots         = [];
        $slotStart     = Carbon::parse($date . ' ' . $availability->start_time)->utc();
        $windowEnd     = Carbon::parse($date . ' ' . $availability->end_time)->utc();
        $durationMins  = $service->duration_minutes;

        $existingAppointments = Appointment::where('staff_id', $staff->id)
            ->whereNotIn('status', [
                AppointmentStatus::Cancelled->value,
                AppointmentStatus::NoShow->value,
            ])
            ->whereDate('starts_at', $requestedDate->toDateString())
            ->get(['starts_at', 'ends_at']);

        while ($slotStart->copy()->addMinutes($durationMins)->lte($windowEnd)) {
            $slotEnd = $slotStart->copy()->addMinutes($durationMins);

            $isOccupied = $existingAppointments->contains(function ($appt) use ($slotStart, $slotEnd) {
                return $slotStart->lt(Carbon::parse($appt->ends_at))
                    && $slotEnd->gt(Carbon::parse($appt->starts_at));
            });

            if (! $isOccupied && $slotStart->isFuture()) {
                $slots[] = [
                    'starts_at'    => $slotStart->toIso8601String(),
                    'ends_at'      => $slotEnd->toIso8601String(),
                    'display_time' => $slotStart->format('g:i A'),
                ];
            }

            $slotStart->addMinutes($durationMins);
        }

        return $slots;
    }

    public function getClientAppointments(User $client): Collection
    {
        return Appointment::where('client_id', $client->id)
            ->with(['service', 'staff.user'])
            ->orderBy('starts_at', 'desc')
            ->get();
    }
}