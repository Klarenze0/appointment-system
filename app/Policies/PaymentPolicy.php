<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function view(User $user, Payment $payment): bool
    {
        if ($user->isAdmin()) return true;

        return $payment->appointment->client_id === $user->id;
    }

    public function process(User $user, Payment $payment): bool
    {
        return $payment->appointment->client_id === $user->id
            && $payment->status === \App\Enums\PaymentStatus::Pending;
    }
}