<?php

namespace App\Services;

use App\Models\Service;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ServiceManagementService
{
    /**
     * Paginated list of services with their assigned staff count.
     */
    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return Service::withCount('staff')
            ->withTrashed(false)
            ->orderBy('name')
            ->paginate($perPage);
    }

    /**
     * Create a service and sync staff assignments atomically.
     */
    public function create(array $data): Service
    {
        return DB::transaction(function () use ($data) {
            $service = Service::create([
                'name'             => $data['name'],
                'description'      => $data['description'] ?? null,
                'duration_minutes' => $data['duration_minutes'],
                'price'            => $data['price'],
                'is_active'        => $data['is_active'] ?? true,
            ]);

            if (! empty($data['staff_ids'])) {
                $service->staff()->sync($data['staff_ids']);
            }

            return $service->load('staff.user');
        });
    }

    /**
     * Update a service and sync staff assignments atomically.
     */
    public function update(Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data) {
            $service->update([
                'name'             => $data['name'],
                'description'      => $data['description'] ?? null,
                'duration_minutes' => $data['duration_minutes'],
                'price'            => $data['price'],
                'is_active'        => $data['is_active'] ?? $service->is_active,
            ]);

            $service->staff()->sync($data['staff_ids'] ?? []);

            return $service->load('staff.user');
        });
    }

    /**
     * Soft-delete a service.
     * Hard delete is never performed — appointments reference this record.
     */
    public function delete(Service $service): void
    {
        $service->delete(); // soft delete via SoftDeletes trait
    }

    /**
     * Load a service with all relationships needed for edit form.
     */
    public function forEdit(Service $service): Service
    {
        return $service->load('staff.user');
    }
}