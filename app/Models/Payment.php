<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'amount',
        'currency',
        'gateway',
        'status',
        'gateway_reference',
        'gateway_payload',
    ];

    protected function casts(): array
    {
        return [
            'amount'           => 'decimal:2',
            'status'           => PaymentStatus::class,
            'gateway_payload'  => 'array',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}