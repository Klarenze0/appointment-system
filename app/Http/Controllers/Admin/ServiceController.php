<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreServiceRequest;
use App\Http\Requests\Admin\UpdateServiceRequest;
use App\Models\Service;
use App\Models\StaffProfile;
use App\Services\ServiceManagementService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    public function __construct(
        private readonly ServiceManagementService $serviceManagement,
    ) {}

    public function index(): Response
    {
        $this->authorize('viewAny', Service::class);

        return Inertia::render('Admin/Services/Index', [
            'services' => $this->serviceManagement->list(),
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Service::class);

        return Inertia::render('Admin/Services/Form', [
            'service'    => null,
            'allStaff'   => StaffProfile::with('user')
                                ->where('is_active', true)
                                ->get(),
        ]);
    }

    public function store(StoreServiceRequest $request): RedirectResponse
    {
        $this->serviceManagement->create($request->validated());

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service created successfully.');
    }

    public function edit(Service $service): Response
    {
        $this->authorize('update', $service);

        return Inertia::render('Admin/Services/Form', [
            'service'  => $this->serviceManagement->forEdit($service),
            'allStaff' => StaffProfile::with('user')
                              ->where('is_active', true)
                              ->get(),
        ]);
    }

    public function update(UpdateServiceRequest $request, Service $service): RedirectResponse
    {
        $this->serviceManagement->update($service, $request->validated());

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $this->authorize('delete', $service);

        $this->serviceManagement->delete($service);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service removed.');
    }
}