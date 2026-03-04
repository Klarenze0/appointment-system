<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\ProcessPaymentRequest;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService,
    ) {}

    /**
     * Ipakita ang payment page para sa isang appointment.
     */
    public function show(Payment $payment): Response
    {
        $this->authorize('view', $payment);

        return Inertia::render('Client/Payments/Show', [
            'payment' => $payment->load('appointment.service', 'appointment.staff.user'),
        ]);
    }

    /**
     * I-process ang payment.
     */
    public function process(ProcessPaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->authorize('process', $payment);

        try {
            $this->paymentService->process($payment);

            return redirect()
                ->route('client.appointments.index')
                ->with('success', 'Payment successful! Your appointment is now confirmed.');

        } catch (\RuntimeException $e) {
            return redirect()
                ->back()
                ->with('error', $e->getMessage());
        }
    }
}