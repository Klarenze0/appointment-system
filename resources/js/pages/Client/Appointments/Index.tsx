import ClientLayout from '@/layouts/ClientLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Appointment, PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import axios from 'axios';

interface Props {
    appointments: (Appointment & {
        payment?: {
            id: number;
            status: string;
            amount: string;
        };
    })[];
    flash?: { success?: string; error?: string };
}



interface SlotOption {
    starts_at: string;
    ends_at: string;
    display_time: string;
}

// Status badge colors
const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    no_show: 'bg-red-50 text-red-700 border-red-200',
};

export default function AppointmentsIndex({ appointments, flash }: Props) {

    const [rescheduling, setRescheduling] = useState<number | null>(null);
    const [newDate, setNewDate] = useState('');
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleSlots, setRescheduleSlots] = useState<SlotOption[]>([]);
    const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

    function handleCancel(id: number) {
        if (confirm('Cancel this appointment?')) {
            router.patch(`/appointments/${id}/cancel`);
        }
    }

    function handleDelete(id: number) {
        if (confirm('Permanently remove this cancelled appointment from your list?')) {
            router.delete(`/appointments/${id}`);
        }
    }

    function handleReschedule(id: number) {
        if (!newDate) return;
        router.patch(`/appointments/${id}/reschedule`, { starts_at: newDate });
        setRescheduling(null);
        setNewDate('');
    }

    async function fetchRescheduleSlots(staffId: number, serviceId: number, date: string) {
        setLoadingRescheduleSlots(true);
        try {
            const response = await axios.get('/appointments/slots', {
                params: { staff_id: staffId, service_id: serviceId, date },
            });
            setRescheduleSlots(response.data.slots);
        } catch {
            setRescheduleSlots([]);
        } finally {
            setLoadingRescheduleSlots(false);
        }
    }

    // Format ISO UTC string to readable local time
    function formatDateTime(iso: string): string {
        return new Date(iso).toLocaleString('en-PH', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    return (
        <ClientLayout title="My Appointments">
            {/* Flash */}
            {flash?.success && (
                <div className="mb-4 text-sm text-green-700 border border-green-200 bg-green-50 px-4 py-2 rounded">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 text-sm text-red-700 border border-red-200 bg-red-50 px-4 py-2 rounded">
                    {flash.error}
                </div>
            )}

            {/* Book button */}
            <div className="flex justify-end mb-4">
                <Link href="/appointments/book">
                    <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-700 text-xs gap-1.5">
                        <Plus size={12} />
                        Book Appointment
                    </Button>
                </Link>
            </div>

            {appointments.length === 0 ? (
                <div className="text-center py-16 text-zinc-400 text-sm border border-zinc-200 rounded-lg">
                    No appointments yet.{' '}
                    <Link href="/appointments/book" className="text-zinc-900 underline">
                        Book your first one.
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {appointments.map((appt) => (
                        <div key={appt.id}
                            className="border border-zinc-200 rounded-lg p-4 bg-white">
                            <div className="flex items-start justify-between gap-4">
                                {/* Info */}
                                <div>
                                    <p className="font-semibold text-zinc-900 text-sm">
                                        {appt.service?.name}
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                        with {appt.staff?.user?.name}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">
                                        {formatDateTime(appt.starts_at)}
                                    </p>
                                </div>

                                {/* Status + Actions */}
                                <div className="flex flex-col items-end gap-2">
                                    <Badge className={`text-[10px] ${statusStyles[appt.status]}`}>
                                        {appt.status.replace('_', ' ').toUpperCase()}
                                    </Badge>


                                    {appt.payment?.status === 'pending' &&
                                        ['pending', 'confirmed'].includes(appt.status) && (
                                            <Link href={`/payments/${appt.payment.id}`}>
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                                >
                                                    Pay ${Number(appt.payment.amount).toFixed(2)}
                                                </Button>
                                            </Link>
                                        )}
                                    {/* Actions — only for cancellable/reschedulable */}
                                    {/* Reschedule + Cancel — para sa pending/confirmed lang */}
                                    {['pending', 'confirmed'].includes(appt.status) && (
                                        <div className="flex gap-1.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-[10px] gap-1 text-zinc-600"
                                                onClick={() => setRescheduling(
                                                    rescheduling === appt.id ? null : appt.id
                                                )}
                                            >
                                                <RefreshCw size={9} />
                                                Reschedule
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-[10px] gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleCancel(appt.id)}
                                            >
                                                <X size={9} />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}

                                    {/* Remove — para sa cancelled lang */}
                                    {appt.status === 'cancelled' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-[10px] gap-1 text-red-500 border-red-200 hover:bg-red-50"
                                            onClick={() => handleDelete(appt.id)}
                                        >
                                            <Trash2 size={9} />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Reschedule inline form */}
                            {rescheduling === appt.id && (
                                <div className="mt-3 pt-3 border-t border-zinc-100">
                                    <div className="flex flex-wrap gap-4">
                                        {/* Date picker */}
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">
                                                Select New Date
                                            </p>
                                            <div className="border border-zinc-200 rounded-lg p-3 bg-white inline-block">
                                                <Calendar
                                                    mode="single"
                                                    selected={rescheduleDate ? new Date(rescheduleDate + 'T00:00:00') : undefined}
                                                    onSelect={(date) => {
                                                        if (!date) return;
                                                        const formatted = date.toLocaleDateString('en-CA');
                                                        setRescheduleDate(formatted);
                                                        setRescheduleSlots([]);
                                                        setNewDate('');
                                                        fetchRescheduleSlots(appt.staff_id, appt.service_id, formatted);
                                                    }}
                                                    disabled={(date) => {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        return date < today;
                                                    }}
                                                    className="text-zinc-900"
                                                />
                                            </div>
                                        </div>

                                        {/* Time slots */}
                                        {rescheduleSlots.length > 0 && (
                                            <div>
                                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1.5">
                                                    Select New Time
                                                </p>
                                                <div className="grid grid-cols-3 gap-1.5 max-w-xs">
                                                    {rescheduleSlots.map(slot => (
                                                        <button
                                                            key={slot.starts_at}
                                                            type="button"
                                                            onClick={() => setNewDate(slot.starts_at)}
                                                            className={`px-2 py-1.5 rounded border text-[10px] font-medium transition-colors ${newDate === slot.starts_at
                                                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                                                                }`}
                                                        >
                                                            {slot.display_time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {loadingRescheduleSlots && (
                                            <p className="text-xs text-zinc-400 self-center">Loading slots...</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            className="h-7 text-[10px] bg-zinc-900 text-white"
                                            onClick={() => handleReschedule(appt.id)}
                                            disabled={!newDate}
                                        >
                                            Confirm Reschedule
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-[10px] text-zinc-400"
                                            onClick={() => {
                                                setRescheduling(null);
                                                setNewDate('');
                                                setRescheduleDate('');
                                                setRescheduleSlots([]);
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </ClientLayout>
    );
}