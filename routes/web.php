<?php

use App\Http\Controllers\Admin\AvailabilityController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Admin\CalendarController;

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
    }); 

require __DIR__.'/settings.php';
