<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffManagementService
{
    /**
     * Paginated list of staff with user relationship.
     */
    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return StaffProfile::with('user')
            ->withCount('services')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create a User with role=staff and their StaffProfile atomically.
     */
    public function create(array $data): StaffProfile
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => UserRole::Staff,
            ]);

            $staffProfile = StaffProfile::create([
                'user_id'   => $user->id,
                'bio'       => $data['bio'] ?? null,
                'phone'     => $data['phone'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (! empty($data['service_ids'])) {
                $staffProfile->services()->sync($data['service_ids']);
            }

            return $staffProfile->load('user', 'services');
        });
    }

    /**
     * Update User and StaffProfile together atomically.
     */
    public function update(StaffProfile $staffProfile, array $data): StaffProfile
    {
        return DB::transaction(function () use ($staffProfile, $data) {
            $staffProfile->user->update([
                'name'  => $data['name'],
                'email' => $data['email'],
            ]);

            $staffProfile->update([
                'bio'       => $data['bio'] ?? null,
                'phone'     => $data['phone'] ?? null,
                'is_active' => $data['is_active'] ?? $staffProfile->is_active,
            ]);

            $staffProfile->services()->sync($data['service_ids'] ?? []);

            return $staffProfile->load('user', 'services');
        });
    }

    /**
     * Deactivate staff — never hard delete.
     * Hard deletion is blocked at DB level (RESTRICT on appointments).
     */
    public function deactivate(StaffProfile $staffProfile): void
    {
        $staffProfile->update(['is_active' => false]);
        $staffProfile->user->update(['role' => UserRole::Staff]); // keep role intact
    }

    /**
     * Load a staff profile with all relationships for the edit form.
     */
    public function forEdit(StaffProfile $staffProfile): StaffProfile
    {
        return $staffProfile->load('user', 'services');
    }

    public function delete(StaffProfile $staffProfile): void
    {
        // I-check kung may active appointments ang staff
        $hasActiveAppointments = \App\Models\Appointment::where('staff_id', $staffProfile->id)
            ->whereNotIn('status', [
                \App\Enums\AppointmentStatus::Cancelled->value,
                \App\Enums\AppointmentStatus::Completed->value,
                \App\Enums\AppointmentStatus::NoShow->value,
            ])
            ->exists();

        if ($hasActiveAppointments) {
            throw new \RuntimeException(
                'Cannot delete this staff member. They have pending or confirmed appointments. Cancel all appointments first before deleting.'
            );
        }

        // Safe na mag-delete — walang active appointments
        DB::transaction(function () use ($staffProfile) {
            $user = $staffProfile->user;

            // I-detach ang lahat ng service assignments
            $staffProfile->services()->detach();

            // I-delete ang availability slots
            $staffProfile->availabilities()->delete();

            // I-delete ang staff profile
            $staffProfile->delete();

            // I-delete ang user account
            $user->delete();
        });
    }
}