<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AppointmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->isAdmin()) return true;

        return $appointment->client_id === $user->id;
    }

    /**
     * Only the client who owns the appointment can cancel it,
     * and only if it's still cancellable.
     */
    public function cancel(User $user, Appointment $appointment): bool
    {
        return $appointment->client_id === $user->id
            && $appointment->status->isCancellable();
    }

    /**
     * Only the client who owns the appointment can reschedule it,
     * and only if it's still reschedulable.
     */
    public function reschedule(User $user, Appointment $appointment): bool
    {
        return $appointment->client_id === $user->id
            && $appointment->status->isReschedulable();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Appointment $appointment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Appointment $appointment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Appointment $appointment): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Appointment $appointment): bool
    {
        return false;
    }
}
