<?php

namespace App\Payments;

use App\Contracts\PaymentGateway;

class SimulationGateway implements PaymentGateway
{
    /**
     * Simulate ang payment initiation.
     * Sa real gateway, dito magpapadala ng API request.
     */
    public function initiate(float $amount, string $currency, array $metadata): array
    {
        return [
            'gateway_reference' => 'SIM-' . strtoupper(uniqid()),
            'gateway_payload'   => [
                'simulated'  => true,
                'amount'     => $amount,
                'currency'   => $currency,
                'metadata'   => $metadata,
                'initiated_at' => now()->toIso8601String(),
            ],
        ];
    }

    /**
     * Sa simulation, palaging "paid" ang result.
     * Sa real gateway, mag-che-check ng actual payment status.
     */
    public function verify(string $gatewayReference): string
    {
        return 'paid';
    }

    /**
     * Sa simulation, palaging successful ang refund.
     */
    public function refund(string $gatewayReference, float $amount): bool
    {
        return true;
    }
}