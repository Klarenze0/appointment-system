<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\RescheduleBookingRequest;
use App\Http\Requests\Client\StoreBookingRequest;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\StaffProfile;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Client/Appointments/Index', [
            'appointments' => $this->bookingService
                ->getClientAppointments(auth()->user()),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Client/Appointments/Book', [
            'services' => Service::where('is_active', true)
                ->with('staff.user')
                ->get(),
        ]);
    }

    public function slots(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'staff_id'   => ['required', 'integer', 'exists:staff_profiles,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'date'       => ['required', 'date', 'after_or_equal:today'],
        ]);

        $staff   = StaffProfile::findOrFail($request->staff_id);
        $service = Service::findOrFail($request->service_id);

        $slots = $this->bookingService->getAvailableSlots(
            $staff,
            $service,
            $request->date
        );

        return response()->json(['slots' => $slots]);
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        try {
            $this->bookingService->book(auth()->user(), $request->validated());

            return redirect()
                ->route('client.appointments.index')
                ->with('success', 'Appointment booked successfully!');

        } catch (\RuntimeException $e) {
            return redirect()
                ->back()
                ->with('error', $e->getMessage())
                ->withInput();
        }
    }

    public function availableDates(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'staff_id'   => ['required', 'integer', 'exists:staff_profiles,id'],
            'service_id' => ['required', 'integer', 'exists:services,id'],
            'month'      => ['required', 'integer', 'min:1', 'max:12'],
            'year'       => ['required', 'integer', 'min:2024'],
        ]);

        $staff   = StaffProfile::findOrFail($request->staff_id);
        $service = Service::findOrFail($request->service_id);

        $dates = $this->bookingService->getAvailableDatesForMonth(
            $staff,
            $service,
            $request->year,
            $request->month
        );

        return response()->json(['dates' => $dates]);
    }

    public function cancel(Appointment $appointment): RedirectResponse
    {
        $this->authorize('cancel', $appointment);

        try {
            $this->bookingService->cancel($appointment);

            return redirect()
                ->route('client.appointments.index')
                ->with('success', 'Appointment cancelled.');

        } catch (\RuntimeException $e) {
            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }

    public function reschedule(RescheduleBookingRequest $request, Appointment $appointment): RedirectResponse
    {
        $this->authorize('reschedule', $appointment);

        try {
            $this->bookingService->reschedule($appointment, $request->starts_at);

            return redirect()
                ->route('client.appointments.index')
                ->with('success', 'Appointment rescheduled successfully.');

        } catch (\RuntimeException $e) {
            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }
}