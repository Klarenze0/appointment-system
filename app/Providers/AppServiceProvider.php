<?php

namespace App\Providers;

use App\Contracts\PaymentGateway;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Service;
use App\Models\StaffProfile;
use App\Payments\SimulationGateway;
use App\Policies\AppointmentPolicy;
use App\Policies\PaymentPolicy;
use App\Policies\ServicePolicy;
use App\Policies\StaffPolicy;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGateway::class, SimulationGateway::class);
    }

    public function boot(): void
    {
        Gate::policy(Service::class,      ServicePolicy::class);
        Gate::policy(StaffProfile::class, StaffPolicy::class);
        Gate::policy(Appointment::class,  AppointmentPolicy::class);
        Gate::policy(Payment::class,      PaymentPolicy::class);
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}