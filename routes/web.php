<?php

use App\Http\Controllers\Admin\AvailabilityController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Client\PaymentController;
use App\Http\Controllers\Admin\CalendarController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Staff\AppointmentController as StaffAppointmentController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\Admin\AppointmentController as AdminAppointmentController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {


        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        Route::resource('services', ServiceController::class)
            ->except(['show']);

        Route::resource('staff', StaffController::class)
            ->except(['show']);

        Route::prefix('staff/{staff}/availability')
            ->name('staff.availability.')
            ->group(function () {
                Route::get('/',         [AvailabilityController::class, 'index'])
                     ->name('index');
                Route::post('/',        [AvailabilityController::class, 'store'])
                     ->name('store');
                Route::patch('/{availability}/toggle', [AvailabilityController::class, 'toggle'])
                     ->name('toggle');
                Route::delete('/{availability}',       [AvailabilityController::class, 'destroy'])
                     ->name('destroy');
                Route::patch('/{availability}', [AvailabilityController::class, 'update'])->name('update');
                
            });    
        Route::get('calendar', [CalendarController::class, 'index'])
            ->name('calendar');
        Route::get('appointments', [AdminAppointmentController::class, 'index'])->name('appointments.index');
        Route::patch('appointments/{appointment}/confirm',  [AdminAppointmentController::class, 'confirm'])->name('appointments.confirm');
        Route::patch('appointments/{appointment}/complete', [AdminAppointmentController::class, 'complete'])->name('appointments.complete');
        Route::patch('appointments/{appointment}/no-show',  [AdminAppointmentController::class, 'noShow'])->name('appointments.no-show');
        Route::patch('appointments/{appointment}/cancel',   [AdminAppointmentController::class, 'cancel'])->name('appointments.cancel');
    });

// ─── Client Routes ────────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:client'])
    ->prefix('appointments')
    ->name('client.appointments.')
    ->group(function () {

        Route::get('/',         [BookingController::class, 'index'])
             ->name('index');

        Route::get('/book',     [BookingController::class, 'create'])
             ->name('create');

        Route::post('/',        [BookingController::class, 'store'])
             ->name('store');

        Route::get('/slots',    [BookingController::class, 'slots'])
             ->name('slots');

        Route::patch('/{appointment}/cancel',     [BookingController::class, 'cancel'])
             ->name('cancel');

        Route::patch('/{appointment}/reschedule', [BookingController::class, 'reschedule'])
             ->name('reschedule');
        Route::get('/available-dates', [BookingController::class, 'availableDates'])
            ->name('available-dates');
        Route::delete('/{appointment}', [BookingController::class, 'destroy'])->name('destroy');
    }); 

Route::middleware(['auth', 'verified', 'role:client'])
    ->group(function () {
        Route::get('/payments/{payment}',          [PaymentController::class, 'show'])->name('client.payments.show');
        Route::post('/payments/{payment}/process', [PaymentController::class, 'process'])->name('client.payments.process');
    });

// Staff routes

Route::middleware(['auth', 'verified', 'role:staff'])
    ->prefix('staff')
    ->name('staff.')
    ->group(function () {
        Route::get('dashboard', [StaffDashboardController::class, 'index'])->name('dashboard');
        Route::get('appointments', [StaffAppointmentController::class, 'index'])->name('appointments.index');
        Route::patch('appointments/{appointment}/complete', [StaffAppointmentController::class, 'complete'])->name('appointments.complete');
        Route::patch('appointments/{appointment}/no-show', [StaffAppointmentController::class, 'noShow'])->name('appointments.no-show');
    });
require __DIR__.'/settings.php';
