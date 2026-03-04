<?php

namespace App\Contracts;

interface PaymentGateway
{

    public function initiate(float $amount, string $currency, array $metadata): array;

    public function verify(string $gatewayReference): string;

    public function refund(string $gatewayReference, float $amount): bool;
}