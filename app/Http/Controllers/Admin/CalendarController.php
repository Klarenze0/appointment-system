<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\CalendarService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function __construct(
        private readonly CalendarService $calendarService,
    ) {}

    public function index(Request $request): Response
    {
        $view = $request->get('view', 'week');  // default: weekly view
        $date = $request->get('date', now()->toDateString());

        $appointments = match($view) {
            'day'   => $this->calendarService->getDailyAppointments($date),
            'month' => $this->calendarService->getMonthlyAppointments(
                            Carbon::parse($date)->year,
                            Carbon::parse($date)->month
                       ),
            default => $this->calendarService->getWeeklyAppointments($date),
        };

        return Inertia::render('Admin/Calendar/Index', [
            'appointments' => $appointments,
            'currentView'  => $view,
            'currentDate'  => $date,
        ]);
    }
}