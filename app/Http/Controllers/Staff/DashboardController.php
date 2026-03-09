<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Services\StaffDashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly StaffDashboardService $dashboardService,
    ) {}

    public function index(): Response
    {
        $staff = auth()->user()->staffProfile;

        return Inertia::render('Staff/Dashboard/Index', [
            'stats'                => $this->dashboardService->getStats($staff),
            'todayAppointments'    => $this->dashboardService->getTodayAppointments($staff),
            'upcomingAppointments' => $this->dashboardService->getUpcomingAppointments($staff),
        ]);
    }
}