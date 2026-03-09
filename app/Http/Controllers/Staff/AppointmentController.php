<?php

namespace App\Http\Controllers\Staff;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\StaffDashboardService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function __construct(
        private readonly StaffDashboardService $dashboardService,
    ) {}

    public function index(): Response
    {
        $staff = auth()->user()->staffProfile;

        return Inertia::render('Staff/Appointments/Index', [
            'appointments' => $this->dashboardService->getAllAppointments($staff),
        ]);
    }

    public function complete(Appointment $appointment): RedirectResponse
    {
        $this->ensureOwnership($appointment);

        if ($appointment->status !== AppointmentStatus::Confirmed) {
            return back()->with('error', 'Only confirmed appointments can be marked as completed.');
        }

        $appointment->update(['status' => AppointmentStatus::Completed]);

        return back()->with('success', 'Appointment marked as completed.');
    }

    public function noShow(Appointment $appointment): RedirectResponse
    {
        $this->ensureOwnership($appointment);

        if (! in_array($appointment->status, [
            AppointmentStatus::Confirmed,
            AppointmentStatus::Pending,
        ])) {
            return back()->with('error', 'Cannot mark this appointment as no-show.');
        }

        $appointment->update(['status' => AppointmentStatus::NoShow]);

        return back()->with('success', 'Appointment marked as no-show.');
    }

    private function ensureOwnership(Appointment $appointment): void
    {
        $staffId = auth()->user()->staffProfile->id;
        abort_if($appointment->staff_id !== $staffId, 403);
    }
}