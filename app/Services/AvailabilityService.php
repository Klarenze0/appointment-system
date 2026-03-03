<?php

namespace App\Services;

use App\Models\StaffAvailability;
use App\Models\StaffProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AvailabilityService
{
    public function getForStaff(StaffProfile $staff): Collection
    {
        return $staff->availabilities()
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    public function sync(StaffProfile $staff, array $availabilities): Collection
    {
        // ─── Check 1: Duplicate days within the submitted batch ───────────────
        $submittedDays = array_column($availabilities, 'day_of_week');

        if (count($submittedDays) !== count(array_unique($submittedDays))) {
            throw new \InvalidArgumentException(
                'You submitted duplicate days. Each day must appear only once.'
            );
        }

        $existingDays = $staff->availabilities()
            ->whereIn('day_of_week', $submittedDays)
            ->pluck('day_of_week')
            ->toArray();

        if (! empty($existingDays)) {
            $dayNames     = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            $conflictList = implode(', ', array_map(fn($d) => $dayNames[$d], $existingDays));

            throw new \InvalidArgumentException(
                "Availability already exists for: {$conflictList}. Delete the existing slot first before adding a new one."
            );
        }

        return DB::transaction(function () use ($staff, $availabilities) {
            foreach ($availabilities as $slot) {
                StaffAvailability::create([
                    'staff_id'    => $staff->id,
                    'day_of_week' => $slot['day_of_week'],
                    'start_time'  => $slot['start_time'],
                    'end_time'    => $slot['end_time'],
                    'is_active'   => $slot['is_active'] ?? true,
                ]);
            }

            return $this->getForStaff($staff);
        });
    }

    public function toggle(StaffAvailability $availability): StaffAvailability
    {
        $availability->update([
            'is_active' => ! $availability->is_active,
        ]);

        return $availability->fresh();
    }

    public function delete(StaffAvailability $availability): void
    {
        $availability->delete();
    }

    public function isStaffAvailable(
        StaffProfile $staff,
        \Carbon\Carbon $startsAt,
        \Carbon\Carbon $endsAt
    ): bool {
        $dayOfWeek = $startsAt->dayOfWeek; // 0=Sunday, 6=Saturday
        $startTime = $startsAt->format('H:i:s');
        $endTime   = $endsAt->format('H:i:s');

        return StaffAvailability::where('staff_id', $staff->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->where('start_time', '<=', $startTime)
            ->where('end_time', '>=', $endTime)
            ->exists();
    }
}