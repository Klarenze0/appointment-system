<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use App\Enums\AppointmentStatus;
use App\Enums\PaymentStatus;
use App\Models\Appointment;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private readonly PaymentGateway $gateway,
    ) {}

    /**
     * Gumawa ng payment record para sa appointment.
     * Tinatawag pagkatapos mag-create ng appointment.
     *
     * Hindi pa nire-charge ang client dito —
     * pending lang ang status hanggang hindi nag-po-proceed.
     */
    public function createForAppointment(Appointment $appointment): Payment
    {
        return Payment::create([
            'appointment_id'    => $appointment->id,
            'amount'            => $appointment->service->price,
            'currency'          => config('payment.currency', 'PHP'),
            'gateway'           => config('payment.gateway', 'simulation'),
            'status'            => PaymentStatus::Pending,
            'gateway_reference' => null,
            'gateway_payload'   => null,
        ]);
    }

    /**
     * I-process ang payment.
     * Dito tinatawag ang gateway.
     *
     * Sa simulation: agad na "paid".
     * Sa real gateway: mag-iintiate ng actual charge.
     */
    public function process(Payment $payment): Payment
    {
        if ($payment->status === PaymentStatus::Paid) {
            throw new \RuntimeException('Payment has already been processed.');
        }

        return DB::transaction(function () use ($payment) {
            $result = $this->gateway->initiate(
                amount:   (float) $payment->amount,
                currency: $payment->currency,
                metadata: [
                    'appointment_id' => $payment->appointment_id,
                    'client_id'      => $payment->appointment->client_id,
                ]
            );

            $payment->update([
                'status'            => PaymentStatus::Paid,
                'gateway_reference' => $result['gateway_reference'],
                'gateway_payload'   => $result['gateway_payload'],
            ]);

            $payment->appointment->update([
                'status' => AppointmentStatus::Confirmed,
            ]);

            return $payment->fresh(['appointment']);
        });
    }

    /**
     * Mag-refund ng payment.
     * Tinatawag kapag na-cancel ang appointment na may payment.
     */
    public function refund(Payment $payment): Payment
    {
        if ($payment->status !== PaymentStatus::Paid) {
            throw new \RuntimeException('Only paid payments can be refunded.');
        }

        return DB::transaction(function () use ($payment) {
            $success = $this->gateway->refund(
                $payment->gateway_reference,
                (float) $payment->amount
            );

            if (! $success) {
                throw new \RuntimeException('Refund failed. Please try again.');
            }

            $payment->update([
                'status' => PaymentStatus::Refunded,
            ]);

            return $payment->fresh();
        });
    }

    /**
     * Kunin ang payment ng isang appointment.
     */
    public function getForAppointment(Appointment $appointment): ?Payment
    {
        return $appointment->payment;
    }
}