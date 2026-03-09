import StaffLayout from '@/layouts/StaffLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, TrendingUp, UserX } from 'lucide-react';

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
    stats: {
        today_appointments:      number;
        this_month_appointments: number;
        completed_appointments:  number;
        pending_appointments:    number;
    };
    todayAppointments:    Appointment[];
    upcomingAppointments: Appointment[];
    flash?: { success?: string; error?: string };
}

const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    no_show:   'bg-red-100 text-red-700 border-red-200',
};

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-PH', {
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

export default function StaffDashboard({ stats, todayAppointments, upcomingAppointments, flash }: Props) {

    function handleComplete(id: number) {
        if (confirm('Mark this appointment as completed?')) {
            router.patch(`/staff/appointments/${id}/complete`);
        }
    }

    function handleNoShow(id: number) {
        if (confirm('Mark as no-show?')) {
            router.patch(`/staff/appointments/${id}/no-show`);
        }
    }

    return (
        <StaffLayout title="Dashboard">
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

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Today</span>
                        <Calendar size={13} className="text-zinc-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-zinc-900">{stats.today_appointments}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">appointments</p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Pending</span>
                        <Clock size={13} className="text-yellow-500" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-yellow-600">{stats.pending_appointments}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">upcoming</p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Completed</span>
                        <CheckCircle size={13} className="text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-emerald-600">{stats.completed_appointments}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">all time</p>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">This Month</span>
                        <TrendingUp size={13} className="text-zinc-400" />
                    </div>
                    <p className="text-2xl font-bold font-mono text-zinc-900">{stats.this_month_appointments}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">appointments</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Today's Schedule */}
                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                        Today's Schedule
                    </h2>
                    {todayAppointments.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-8">No appointments today</p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {todayAppointments.map(appt => (
                                <div key={appt.id} className="border border-zinc-100 rounded-lg p-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900">{appt.client.name}</p>
                                            <p className="text-xs text-zinc-500">
                                                {appt.service.name} · {formatTime(appt.starts_at)} – {formatTime(appt.ends_at)}
                                            </p>
                                        </div>
                                        <Badge className={`text-[9px] shrink-0 ${statusStyles[appt.status]}`}>
                                            {appt.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    {appt.status === 'confirmed' && (
                                        <div className="flex gap-1.5 mt-2">
                                            <Button size="sm"
                                                className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                                onClick={() => handleComplete(appt.id)}>
                                                <CheckCircle size={9} /> Complete
                                            </Button>
                                            <Button size="sm" variant="outline"
                                                className="h-6 text-[10px] text-red-500 border-red-200 hover:bg-red-50 gap-1"
                                                onClick={() => handleNoShow(appt.id)}>
                                                <UserX size={9} /> No Show
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming */}
                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                        Upcoming Appointments
                    </h2>
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-8">No upcoming appointments</p>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {upcomingAppointments.map(appt => (
                                <div key={appt.id}
                                    className="flex items-center gap-3 px-3 py-2.5 border border-zinc-100 rounded-lg">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-zinc-900 truncate">{appt.client.name}</p>
                                        <p className="text-[10px] text-zinc-500 truncate">
                                            {appt.service.name} · {formatDateTime(appt.starts_at)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {appt.payment && (
                                            <Badge className={`text-[9px] ${
                                                appt.payment.status === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                            }`}>
                                                {appt.payment.status === 'paid' ? '₱ paid' : '₱ pending'}
                                            </Badge>
                                        )}
                                        <Badge className={`text-[9px] ${statusStyles[appt.status]}`}>
                                            {appt.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
}