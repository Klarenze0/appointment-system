<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\StaffProfile;
use Carbon\Carbon;

class StaffDashboardService
{
    public function getStats(StaffProfile $staff): array
    {
        $today     = Carbon::today()->toDateString();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'today_appointments' => Appointment::where('staff_id', $staff->id)
                ->whereDate('starts_at', $today)
                ->whereNotIn('status', [
                    AppointmentStatus::Cancelled->value,
                    AppointmentStatus::NoShow->value,
                ])->count(),

            'this_month_appointments' => Appointment::where('staff_id', $staff->id)
                ->where('created_at', '>=', $thisMonth)
                ->count(),

            'completed_appointments' => Appointment::where('staff_id', $staff->id)
                ->where('status', AppointmentStatus::Completed)
                ->count(),

            'pending_appointments' => Appointment::where('staff_id', $staff->id)
                ->whereIn('status', [
                    AppointmentStatus::Pending->value,
                    AppointmentStatus::Confirmed->value,
                ])->count(),
        ];
    }

    public function getTodayAppointments(StaffProfile $staff): \Illuminate\Support\Collection
    {
        return Appointment::with(['client', 'service', 'payment'])
            ->where('staff_id', $staff->id)
            ->whereDate('starts_at', Carbon::today()->toDateString())
            ->whereNotIn('status', [AppointmentStatus::Cancelled->value])
            ->orderBy('starts_at')
            ->get();
    }

    public function getUpcomingAppointments(StaffProfile $staff): \Illuminate\Support\Collection
    {
        return Appointment::with(['client', 'service', 'payment'])
            ->where('staff_id', $staff->id)
            ->where('starts_at', '>', Carbon::now())
            ->whereIn('status', [
                AppointmentStatus::Pending->value,
                AppointmentStatus::Confirmed->value,
            ])
            ->orderBy('starts_at')
            ->limit(10)
            ->get();
    }

    public function getAllAppointments(StaffProfile $staff): \Illuminate\Support\Collection
    {
        return Appointment::with(['client', 'service', 'payment'])
            ->where('staff_id', $staff->id)
            ->orderBy('starts_at', 'desc')
            ->get();
    }
}