<?php

use App\Http\Controllers\Admin\AvailabilityController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\StaffController;


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
            });    
    });

require __DIR__.'/settings.php';
