<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'duration_minutes',
        'price',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price'            => 'decimal:2',
            'is_active'        => 'boolean',
            'duration_minutes' => 'integer',
        ];
    }

    public function staff(): BelongsToMany
    {
        return $this->belongsToMany(StaffProfile::class, 'service_staff', 'service_id', 'staff_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }
}