<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Pending   = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
    case NoShow    = 'no_show';

    public function label(): string
    {
        return match($this) {
            AppointmentStatus::Pending   => 'Pending',
            AppointmentStatus::Confirmed => 'Confirmed',
            AppointmentStatus::Cancelled => 'Cancelled',
            AppointmentStatus::Completed => 'Completed',
            AppointmentStatus::NoShow    => 'No Show',
        };
    }

    public function isCancellable(): bool
    {
        return in_array($this, [
            AppointmentStatus::Pending,
            AppointmentStatus::Confirmed,
        ]);
    }

    public function isReschedulable(): bool
    {
        return in_array($this, [
            AppointmentStatus::Pending,
            AppointmentStatus::Confirmed,
        ]);
    }
}