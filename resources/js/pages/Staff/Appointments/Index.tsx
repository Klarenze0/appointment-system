import StaffLayout from '@/layouts/StaffLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { CheckCircle, UserX } from 'lucide-react';

interface Appointment {
    id: number;
    status: string;
    starts_at: string;
    ends_at: string;
    client:  { name: string; email: string };
    service: { name: string; duration_minutes: number };
    payment?: { status: string; amount: string };
}

interface Props {
    appointments: Appointment[];
    flash?: { success?: string; error?: string };
}

const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    no_show:   'bg-red-100 text-red-700 border-red-200',
};

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

export default function StaffAppointments({ appointments, flash }: Props) {

    function handleComplete(id: number) {
        if (confirm('Mark as completed?')) router.patch(`/staff/appointments/${id}/complete`);
    }

    function handleNoShow(id: number) {
        if (confirm('Mark as no-show?')) router.patch(`/staff/appointments/${id}/no-show`);
    }

    return (
        <StaffLayout title="My Appointments">
            {flash?.success && (
                <div className="mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )}

            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50">
                            <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Client</th>
                            <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Service</th>
                            <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Date & Time</th>
                            <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Payment</th>
                            <th className="text-left px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Status</th>
                            <th className="text-right px-4 py-3 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                                    No appointments yet
                                </td>
                            </tr>
                        ) : appointments.map(appt => (
                            <tr key={appt.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-zinc-900">{appt.client.name}</p>
                                    <p className="text-zinc-400 text-[10px]">{appt.client.email}</p>
                                </td>
                                <td className="px-4 py-3 text-zinc-700">{appt.service.name}</td>
                                <td className="px-4 py-3 text-zinc-700 font-mono">{formatDateTime(appt.starts_at)}</td>
                                <td className="px-4 py-3">
                                    {appt.payment ? (
                                        <Badge className={`text-[9px] ${
                                            appt.payment.status === 'paid'
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                : 'bg-zinc-100 text-zinc-500 border-zinc-200'
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
                                    <div className="flex gap-1.5 justify-end">
                                        {appt.status === 'confirmed' && (
                                            <>
                                                <Button size="sm" variant="outline"
                                                    className="h-6 text-[10px] text-emerald-600 border-emerald-200 hover:bg-emerald-50 gap-1"
                                                    onClick={() => handleComplete(appt.id)}>
                                                    <CheckCircle size={9} /> Complete
                                                </Button>
                                                <Button size="sm" variant="outline"
                                                    className="h-6 text-[10px] text-red-500 border-red-200 hover:bg-red-50 gap-1"
                                                    onClick={() => handleNoShow(appt.id)}>
                                                    <UserX size={9} /> No Show
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
        </StaffLayout>
    );
}