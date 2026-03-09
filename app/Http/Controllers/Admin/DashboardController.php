<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard/Index', [
            'stats'             => $this->dashboardService->getStats(),
            'recentAppointments' => $this->dashboardService->getRecentAppointments(),
            'todayAppointments' => $this->dashboardService->getTodayAppointments(),
            'monthlyRevenue'    => $this->dashboardService->getMonthlyRevenue(),
            'statusBreakdown'   => $this->dashboardService->getStatusBreakdown(),
            'recentNotifications' => $this->dashboardService->getRecentNotifications(),
        ]);
    }
}