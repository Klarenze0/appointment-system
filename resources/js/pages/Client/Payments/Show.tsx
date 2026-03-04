import ClientLayout from '@/layouts/ClientLayout';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { CreditCard, Calendar, User, Scissors, CheckCircle } from 'lucide-react';

interface Props {
    payment: {
        id: number;
        amount: string;
        currency: string;
        status: string;
        gateway: string;
        appointment: {
            id: number;
            starts_at: string;
            ends_at: string;
            status: string;
            service: { name: string; duration_minutes: number };
            staff: { user: { name: string } };
        };
    };
    flash?: { success?: string; error?: string };
}

export default function PaymentShow({ payment, flash }: Props) {

    const { post, processing } = useForm({});

    function handlePay(e: React.FormEvent) {
        e.preventDefault();
        post(`/payments/${payment.id}/process`);
    }

    function formatDateTime(iso: string): string {
        return new Date(iso).toLocaleString('en-PH', {
            weekday: 'long',
            month:   'long',
            day:     'numeric',
            year:    'numeric',
            hour:    'numeric',
            minute:  '2-digit',
            hour12:  true,
        });
    }

    const isPaid = payment.status === 'paid';

    return (
        <ClientLayout title="Payment">
            {flash?.error && (
                <div className="mb-4 text-sm text-red-700 border border-red-200 bg-red-50 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )}

            <div className="max-w-md mx-auto">
                {/* Appointment Summary */}
                <div className="border border-zinc-200 rounded-xl p-5 bg-white mb-4">
                    <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                        Appointment Summary
                    </h2>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <Scissors size={14} className="text-zinc-400 shrink-0" />
                            <div>
                                <p className="font-medium text-zinc-900">
                                    {payment.appointment.service.name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {payment.appointment.service.duration_minutes} minutes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <User size={14} className="text-zinc-400 shrink-0" />
                            <p className="text-zinc-700">
                                with {payment.appointment.staff.user.name}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <Calendar size={14} className="text-zinc-400 shrink-0" />
                            <p className="text-zinc-700">
                                {formatDateTime(payment.appointment.starts_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Box */}
                <div className="border border-zinc-200 rounded-xl p-5 bg-white">
                    <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                        Payment Details
                    </h2>

                    {/* Amount */}
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-sm text-zinc-600">Total Amount</span>
                        <span className="text-2xl font-bold text-zinc-900">
                            {payment.currency} {Number(payment.amount).toFixed(2)}
                        </span>
                    </div>

                    {/* Gateway badge */}
                    <div className="flex items-center gap-2 mb-5 pb-5 border-b border-zinc-100">
                        <CreditCard size={14} className="text-zinc-400" />
                        <span className="text-xs text-zinc-500 capitalize">
                            {payment.gateway === 'simulation'
                                ? 'Simulated Payment (Test Mode)'
                                : payment.gateway
                            }
                        </span>
                    </div>

                    {/* Paid state */}
                    {isPaid ? (
                        <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle size={18} />
                            <span className="text-sm font-medium">Payment Successful</span>
                        </div>
                    ) : (
                        <form onSubmit={handlePay}>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-zinc-900 text-white hover:bg-zinc-700 text-sm py-5"
                            >
                                {processing
                                    ? 'Processing...'
                                    : `Pay ${payment.currency} ${Number(payment.amount).toFixed(2)}`
                                }
                            </Button>
                            <p className="text-xs text-zinc-400 text-center mt-3">
                                This is a simulated payment. No real charge will be made.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
}