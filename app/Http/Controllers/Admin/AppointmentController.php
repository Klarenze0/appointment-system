<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AppointmentController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
    ) {}

    public function index(): Response
    {
        $appointments = Appointment::with(['client', 'service', 'staff.user', 'payment'])
            ->orderBy('starts_at', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id'        => $appointment->id,
                    'status'    => $appointment->status->value,
                    'starts_at' => $appointment->starts_at,
                    'ends_at'   => $appointment->ends_at,
                    'notes'     => $appointment->notes,
                    'client'    => [
                        'name'  => $appointment->client->name,
                        'email' => $appointment->client->email,
                    ],
                    'service'   => [
                        'name'  => $appointment->service->name,
                        'price' => $appointment->service->price,
                    ],
                    'staff'     => [
                        'user' => [
                            'name' => $appointment->staff->user->name,
                        ],
                    ],
                    'payment'   => $appointment->payment ? [
                        'status' => $appointment->payment->status->value,
                        'amount' => $appointment->payment->amount,
                    ] : null,
                ];
            });

        return Inertia::render('Admin/Appointments/Index', [
            'appointments' => $appointments,
        ]);
    }

    public function confirm(Appointment $appointment): RedirectResponse
    {
        if ($appointment->status !== AppointmentStatus::Pending) {
            return back()->with('error', 'Only pending appointments can be confirmed.');
        }

        $appointment->update(['status' => AppointmentStatus::Confirmed]);

        return back()->with('success', 'Appointment confirmed.');
    }

    public function complete(Appointment $appointment): RedirectResponse
    {
        if ($appointment->status !== AppointmentStatus::Confirmed) {
            return back()->with('error', 'Only confirmed appointments can be marked as completed.');
        }

        $appointment->update(['status' => AppointmentStatus::Completed]);

        return back()->with('success', 'Appointment marked as completed.');
    }

    public function noShow(Appointment $appointment): RedirectResponse
    {
        if (! in_array($appointment->status, [
            AppointmentStatus::Confirmed,
            AppointmentStatus::Pending,
        ])) {
            return back()->with('error', 'Cannot mark this appointment as no-show.');
        }

        $appointment->update(['status' => AppointmentStatus::NoShow]);

        return back()->with('success', 'Appointment marked as no-show.');
    }

    public function cancel(Appointment $appointment): RedirectResponse
    {
        try {
            $this->bookingService->cancel($appointment);
            return back()->with('success', 'Appointment cancelled.');
        } catch (\RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}