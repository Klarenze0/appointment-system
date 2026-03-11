import AdminLayout from '@/layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router, usePage } from '@inertiajs/react';
import { CheckCircle, UserX, XCircle, ThumbsUp } from 'lucide-react';
import { PageProps } from '@/types';

interface Appointment {
    id: number;
    status: string;
    starts_at: string;
    ends_at: string;
    notes: string | null;
    client:  { name: string; email: string };
    service: { name: string; price: string };
    staff:   { user: { name: string } };
    payment?: { status: string; amount: string };
}

interface Props extends PageProps {
    appointments: Appointment[];
}

const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    confirmed: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    completed: 'bg-blue-900/30 text-blue-400 border-blue-800',
    cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
    no_show:   'bg-red-900/30 text-red-400 border-red-800',
};

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

export default function AdminAppointments({ appointments, flash }: Props & { flash?: { success?: string; error?: string } }) {

    function handleConfirm(id: number) {
        if (confirm('Confirm this appointment?')) {
            router.patch(`/admin/appointments/${id}/confirm`);
        }
    }

    function handleComplete(id: number) {
        if (confirm('Mark as completed?')) {
            router.patch(`/admin/appointments/${id}/complete`);
        }
    }

    function handleNoShow(id: number) {
        if (confirm('Mark as no-show?')) {
            router.patch(`/admin/appointments/${id}/no-show`);
        }
    }

    function handleCancel(id: number) {
        if (confirm('Cancel this appointment? If paid, a refund will be issued.')) {
            router.patch(`/admin/appointments/${id}/cancel`);
        }
    }

    return (
        <AdminLayout title="Appointments">
            {flash?.success && (
                <div className="mb-4 text-sm text-emerald-400 bg-emerald-900/20 border border-emerald-800 px-4 py-3 rounded">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )}

            {/* Summary counts */}
            <div className="flex gap-4 mb-4 flex-wrap">
                {['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map(status => {
                    const count = appointments.filter(a => a.status === status).length;
                    return (
                        <div key={status} className="flex items-center gap-1.5">
                            <Badge className={`text-[9px] ${statusStyles[status]}`}>
                                {status.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-zinc-400 font-mono">{count}</span>
                        </div>
                    );
                })}
            </div>

            <div className="border border-zinc-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900">
                                <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Client</th>
                                <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Service</th>
                                <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Staff</th>
                                <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Date & Time</th>
                                <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Payment</th>
                                <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Status</th>
                                <th className="text-right px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {appointments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-600">
                                        No appointments yet
                                    </td>
                                </tr>
                            ) : appointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-zinc-200">{appt.client.name}</p>
                                        <p className="text-zinc-500 text-[10px]">{appt.client.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-zinc-300">{appt.service.name}</td>
                                    <td className="px-4 py-3 text-zinc-300">{appt.staff.user.name}</td>
                                    <td className="px-4 py-3 text-zinc-300 font-mono text-[10px]">
                                        {formatDateTime(appt.starts_at)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {appt.payment ? (
                                            <Badge className={`text-[9px] ${
                                                appt.payment.status === 'paid'
                                                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                                                    : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}>
                                                {appt.payment.status === 'paid'
                                                    ? `₱${Number(appt.payment.amount).toFixed(2)}`
                                                    : 'Pending'
                                                }
                                            </Badge>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge className={`text-[9px] ${statusStyles[appt.status]}`}>
                                            {appt.status.replace('_', ' ')}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1 justify-end flex-wrap">
                                            {appt.status === 'pending' && (
                                                <Button size="sm" variant="outline"
                                                    className="h-6 text-[10px] text-emerald-400 border-emerald-800 hover:bg-emerald-900/30 gap-1"
                                                    onClick={() => handleConfirm(appt.id)}>
                                                    <ThumbsUp size={9} /> Confirm
                                                </Button>
                                            )}
                                            {appt.status === 'confirmed' && (
                                                <Button size="sm" variant="outline"
                                                    className="h-6 text-[10px] text-blue-400 border-blue-800 hover:bg-blue-900/30 gap-1"
                                                    onClick={() => handleComplete(appt.id)}>
                                                    <CheckCircle size={9} /> Complete
                                                </Button>
                                            )}
                                            {['pending', 'confirmed'].includes(appt.status) && (
                                                <>
                                                    <Button size="sm" variant="outline"
                                                        className="h-6 text-[10px] text-orange-400 border-orange-800 hover:bg-orange-900/30 gap-1"
                                                        onClick={() => handleNoShow(appt.id)}>
                                                        <UserX size={9} /> No Show
                                                    </Button>
                                                    <Button size="sm" variant="outline"
                                                        className="h-6 text-[10px] text-red-400 border-red-800 hover:bg-red-900/30 gap-1"
                                                        onClick={() => handleCancel(appt.id)}>
                                                        <XCircle size={9} /> Cancel
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}