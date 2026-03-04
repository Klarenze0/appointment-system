<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAvailabilityRequest;
use App\Models\StaffAvailability;
use App\Models\StaffProfile;
use App\Services\AvailabilityService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Requests\Admin\UpdateAvailabilityRequest;

class AvailabilityController extends Controller
{
    public function __construct(
        private readonly AvailabilityService $availabilityService,
    ) {}

    /**
     * Ipakita ang availability management page ng isang staff.
     */
    public function index(StaffProfile $staff): Response
    {
        return Inertia::render('Admin/Availability/Index', [
            'staff'        => $staff->load('user'),
            'availabilities' => $this->availabilityService->getForStaff($staff),
        ]);
    }

    /**
     * I-save ang bagong set ng availability.
     * Tinatanggap ang array ng availability slots.
     */
    public function store(StoreAvailabilityRequest $request, StaffProfile $staff): RedirectResponse
    {
        try {
        $this->availabilityService->sync($staff, $request->validated()['availabilities']);

        return redirect()
            ->route('admin.staff.availability.index', $staff)
            ->with('success', 'Availability updated successfully.');

        } catch (\InvalidArgumentException $e) {
            return redirect()
                ->route('admin.staff.availability.index', $staff)
                ->with('error', $e->getMessage());
        }
    }

    /**
     * I-toggle ang is_active ng isang slot.
     */
    public function toggle(StaffProfile $staff, StaffAvailability $availability): RedirectResponse
    {
        $this->availabilityService->toggle($availability);

        return redirect()
            ->route('admin.staff.availability.index', $staff)
            ->with('success', 'Availability slot updated.');
    }

    public function update(UpdateAvailabilityRequest $request, StaffProfile $staff, StaffAvailability $availability): RedirectResponse
    {
        $this->availabilityService->update($availability, $request->validated());

        return redirect()
            ->route('admin.staff.availability.index', $staff)
            ->with('success', 'Availability slot updated.');
    }
    /**
     * Burahin ang isang slot.
     */
    public function destroy(StaffProfile $staff, StaffAvailability $availability): RedirectResponse
    {
        $this->availabilityService->delete($availability);

        return redirect()
            ->route('admin.staff.availability.index', $staff)
            ->with('success', 'Availability slot removed.');
    }
}