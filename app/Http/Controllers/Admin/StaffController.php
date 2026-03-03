<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStaffRequest;
use App\Http\Requests\Admin\UpdateStaffRequest;
use App\Models\Service;
use App\Models\StaffProfile;
use App\Services\StaffManagementService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    public function __construct(
        private readonly StaffManagementService $staffManagement,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', StaffProfile::class);

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $this->staffManagement->list(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', StaffProfile::class);

        return Inertia::render('Admin/Staff/Form', [
            'staffMember' => null,
            'allServices' => Service::where('is_active', true)->get(),
        ]);
    }

    public function store(StoreStaffRequest $request): RedirectResponse
    {
        $this->staffManagement->create($request->validated());

        return redirect()
            ->route('admin.staff.index')
            ->with('success', 'Staff member created successfully.');
    }

    public function edit(StaffProfile $staff): Response
    {
        $this->authorize('update', $staff);

        return Inertia::render('Admin/Staff/Form', [
            'staffMember' => $this->staffManagement->forEdit($staff),
            'allServices' => Service::where('is_active', true)->get(),
        ]);
    }

    public function update(UpdateStaffRequest $request, StaffProfile $staff): RedirectResponse
    {
        $this->staffManagement->update($staff, $request->validated());

        return redirect()
            ->route('admin.staff.index')
            ->with('success', 'Staff member updated.');
    }

    public function destroy(StaffProfile $staff): RedirectResponse
    {
        $this->authorize('delete', $staff);

        $this->staffManagement->deactivate($staff);

        return redirect()
            ->route('admin.staff.index')
            ->with('success', 'Staff member deactivated.');
    }
}