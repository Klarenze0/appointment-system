<?php

namespace App\Services;

use App\Enums\AppointmentStatus;
use App\Enums\PaymentStatus;
use App\Models\Appointment;
use App\Models\NotificationLog;
use App\Models\Payment;
use App\Models\StaffProfile;
use App\Models\User;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Kunin ang lahat ng stats para sa dashboard.
     */
    public function getStats(): array
    {
        $now = Carbon::now();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'total_appointments' => Appointment::count(),
            'this_month_appointments' => Appointment::where('created_at', '>=', $thisMonth)->count(),

            'pending_appointments' => Appointment::where('status', AppointmentStatus::Pending)->count(),
            'confirmed_appointments' => Appointment::where('status', AppointmentStatus::Confirmed)->count(),
            'today_appointments' => Appointment::whereDate('starts_at', $now->toDateString())
                ->whereNotIn('status', [
                    AppointmentStatus::Cancelled->value,
                    AppointmentStatus::NoShow->value,
                ])->count(),

            'total_revenue' => Payment::where('status', PaymentStatus::Paid)->sum('amount'),
            'this_month_revenue' => Payment::where('status', PaymentStatus::Paid)
                ->where('created_at', '>=', $thisMonth)
                ->sum('amount'),

            'total_clients' => User::where('role', 'client')->count(),
            'total_staff' => StaffProfile::where('is_active', true)->count(),

            'notifications_sent' => NotificationLog::where('status', 'sent')->count(),
            'notifications_failed' => NotificationLog::where('status', 'failed')->count(),
        ];
    }

    /**
     * Kunin ang pinakabagong appointments.
     */
    public function getRecentAppointments(int $limit = 8): \Illuminate\Support\Collection
    {
        return Appointment::with(['client', 'service', 'staff.user', 'payment'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Kunin ang appointments ngayong araw.
     */
    public function getTodayAppointments(): \Illuminate\Support\Collection
    {
        return Appointment::with(['client', 'service', 'staff.user'])
            ->whereDate('starts_at', Carbon::today()->toDateString())
            ->whereNotIn('status', [
                AppointmentStatus::Cancelled->value,
                AppointmentStatus::NoShow->value,
            ])
            ->orderBy('starts_at')
            ->get();
    }

    /**
     * Kunin ang revenue per month para sa chart (last 6 months).
     */
    public function getMonthlyRevenue(): array
    {
        $months = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);

            $revenue = Payment::where('status', PaymentStatus::Paid)
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('amount');

            $months[] = [
                'month' => $month->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        }

        return $months;
    }

    /**
     * Kunin ang appointment counts per status.
     */
    public function getStatusBreakdown(): array
    {
        return Appointment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($row) => [
                (string) $row->status->value => (int) $row->count
            ])
            ->toArray();
    }

    /**
     * Kunin ang pinakabagong notification logs.
     */
    public function getRecentNotifications(int $limit = 10): \Illuminate\Support\Collection
    {
        return NotificationLog::with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}