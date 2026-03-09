<?php

namespace App\Services;

use App\Models\StaffAvailability;
use App\Models\StaffProfile;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AvailabilityService
{

    public function getForStaff(StaffProfile $staff): Collection
    {
        return $staff->availabilities()
            ->orderBy('available_date')
            ->orderBy('start_time')
            ->get();
    }


    public function sync(StaffProfile $staff, array $availabilities): Collection
    {
        $submittedDates = array_column($availabilities, 'date');

        if (count($submittedDates) !== count(array_unique($submittedDates))) {
            throw new \InvalidArgumentException(
                'You submitted duplicate dates. Each date must appear only once.'
            );
        }

        $existingDates = $staff->availabilities()
            ->whereIn('available_date', $submittedDates)
            ->pluck('available_date')
            ->map(fn($d) => \Carbon\Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        if (! empty($existingDates)) {
            $conflictList = implode(', ', array_map(
                fn($d) => \Carbon\Carbon::parse($d)->format('M d, Y'),
                $existingDates
            ));
            throw new \InvalidArgumentException(
                "Availability already exists for: {$conflictList}. Delete the existing slot first."
            );
        }

        return DB::transaction(function () use ($staff, $availabilities) {
            foreach ($availabilities as $slot) {
                StaffAvailability::create([
                    'staff_id'       => $staff->id,
                    'available_date' => $slot['date'],  // ← galing sa form ay 'date' pa rin
                    'start_time'     => $slot['start_time'],
                    'end_time'       => $slot['end_time'],
                    'is_active'      => $slot['is_active'] ?? true,
                ]);
            }

            return $this->getForStaff($staff);
        });
    }


    public function toggle(StaffAvailability $availability): StaffAvailability
    {
        $availability->update(['is_active' => ! $availability->is_active]);
        return $availability->fresh();
    }

    public function delete(StaffAvailability $availability): void
    {
        $availability->delete();
    }


    public function update(StaffAvailability $availability, array $data): StaffAvailability
    {
        $availability->update([
            'date'       => $data['date'],
            'start_time' => $data['start_time'],
            'end_time'   => $data['end_time'],
            'is_active'  => $data['is_active'] ?? $availability->is_active,
        ]);

        return $availability->fresh();
    }

    public function isStaffAvailable(
        StaffProfile $staff,
        \Carbon\Carbon $startsAt,
        \Carbon\Carbon $endsAt
    ): bool {
        $date      = $startsAt->toDateString();
        $startTime = $startsAt->format('H:i:s');
        $endTime   = $endsAt->format('H:i:s');

        return StaffAvailability::where('staff_id', $staff->id)
            ->where('available_date', $date)
            ->where('is_active', true)
            ->where('start_time', '<=', $startTime)
            ->where('end_time',   '>=', $endTime)
            ->exists();
    }
}