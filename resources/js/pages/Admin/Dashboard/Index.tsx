import AdminLayout from '@/layouts/AdminLayout';
import {
    TrendingUp, Users, Calendar, Clock,
    CheckCircle, XCircle, Bell, BellOff,
    DollarSign, UserCheck, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Appointment {
    id: number;
    status: string;
    starts_at: string;
    client:  { name: string };
    service: { name: string };
    staff:   { user: { name: string } };
    payment?: { status: string; amount: string };
}

interface NotificationLog {
    id: number;
    type: string;
    channel: string;
    status: string;
    sent_at: string | null;
    created_at: string;
    user: { name: string; email: string };
}

interface Props {
    stats: {
        total_appointments:      number;
        this_month_appointments: number;
        pending_appointments:    number;
        confirmed_appointments:  number;
        today_appointments:      number;
        total_revenue:           number;
        this_month_revenue:      number;
        total_clients:           number;
        total_staff:             number;
        notifications_sent:      number;
        notifications_failed:    number;
    };
    recentAppointments:   Appointment[];
    todayAppointments:    Appointment[];
    monthlyRevenue:       { month: string; revenue: number }[];
    statusBreakdown:      Record<string, number>;
    recentNotifications:  NotificationLog[];
}

const statusStyles: Record<string, string> = {
    pending:   'bg-yellow-900/30 text-yellow-400 border-yellow-800',
    confirmed: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
    cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
    completed: 'bg-blue-900/30 text-blue-400 border-blue-800',
    no_show:   'bg-red-900/30 text-red-400 border-red-800',
};

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-PH', {
        month:   'short',
        day:     'numeric',
        hour:    'numeric',
        minute:  '2-digit',
        hour12:  true,
    });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-PH', {
        hour:    'numeric',
        minute:  '2-digit',
        hour12:  true,
    });
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style:    'currency',
        currency: 'PHP',
    }).format(amount);
}

export default function Dashboard({
    stats,
    recentAppointments,
    todayAppointments,
    monthlyRevenue,
    statusBreakdown,
    recentNotifications,
}: Props) {

    // Compute max revenue para sa bar chart scaling
    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

    return (
        <AdminLayout title="Dashboard">
            {/* ── Stats Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

                {/* Today */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Today</span>
                        <Calendar size={14} className="text-zinc-600" />
                    </div>
                    <p className="text-2xl font-bold text-white font-mono">
                        {stats.today_appointments}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">appointments</p>
                </div>

                {/* Pending */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Pending</span>
                        <Clock size={14} className="text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-400 font-mono">
                        {stats.pending_appointments}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">awaiting payment</p>
                </div>

                {/* This Month Revenue */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Revenue</span>
                        <DollarSign size={14} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-400 font-mono">
                        ₱{Number(stats.this_month_revenue).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">this month</p>
                </div>

                {/* Total Clients */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Clients</span>
                        <Users size={14} className="text-zinc-600" />
                    </div>
                    <p className="text-2xl font-bold text-white font-mono">
                        {stats.total_clients}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1">registered</p>
                </div>
            </div>

            {/* ── Main Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

                {/* Today's Schedule */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                        Today's Schedule
                    </h2>

                    {todayAppointments.length === 0 ? (
                        <p className="text-xs text-zinc-600 py-4 text-center">
                            No appointments today
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {todayAppointments.map(appt => (
                                <div key={appt.id}
                                    className="flex items-start gap-2.5 p-2.5 bg-zinc-800/50 rounded-md">
                                    <div className="text-right shrink-0 w-14">
                                        <p className="text-[10px] font-mono text-zinc-300">
                                            {formatTime(appt.starts_at)}
                                        </p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-white truncate">
                                            {appt.client.name}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 truncate">
                                            {appt.service.name} · {appt.staff.user.name}
                                        </p>
                                    </div>
                                    <Badge className={`text-[9px] ml-auto shrink-0 ${statusStyles[appt.status]}`}>
                                        {appt.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Breakdown */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                        Status Breakdown
                    </h2>

                    <div className="space-y-2.5">
                        {Object.entries(statusBreakdown).map(([status, count]) => {
                            const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
                            const pct   = total > 0 ? Math.round((count / total) * 100) : 0;

                            return (
                                <div key={status}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[10px] text-zinc-400 capitalize">
                                            {status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-300">
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                status === 'confirmed' ? 'bg-emerald-500' :
                                                status === 'pending'   ? 'bg-yellow-500' :
                                                status === 'cancelled' ? 'bg-zinc-600'   :
                                                status === 'completed' ? 'bg-blue-500'   :
                                                'bg-red-500'
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        {Object.keys(statusBreakdown).length === 0 && (
                            <p className="text-xs text-zinc-600 text-center py-4">
                                No appointments yet
                            </p>
                        )}
                    </div>

                    {/* Summary numbers */}
                    <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[10px] text-zinc-500">Total All Time</p>
                            <p className="text-lg font-bold font-mono text-white">
                                {stats.total_appointments}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500">This Month</p>
                            <p className="text-lg font-bold font-mono text-white">
                                {stats.this_month_appointments}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                        Monthly Revenue
                    </h2>
                    <p className="text-[10px] text-zinc-600 mb-4">Last 6 months</p>

                    <div className="flex items-end gap-1.5 h-32">
                        {monthlyRevenue.map((m) => {
                            const heightPct = maxRevenue > 0
                                ? Math.max((m.revenue / maxRevenue) * 100, 2)
                                : 2;

                            return (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[8px] text-zinc-500 font-mono">
                                        {m.revenue > 0 ? `₱${Math.round(m.revenue / 1000)}k` : ''}
                                    </span>
                                    <div
                                        className="w-full bg-emerald-500/80 rounded-t transition-all hover:bg-emerald-400"
                                        style={{ height: `${heightPct}%` }}
                                        title={`${m.month}: ${formatCurrency(m.revenue)}`}
                                    />
                                    <span className="text-[8px] text-zinc-600 text-center leading-tight">
                                        {m.month.split(' ')[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800">
                        <p className="text-[10px] text-zinc-500">Total Revenue</p>
                        <p className="text-lg font-bold font-mono text-emerald-400">
                            {formatCurrency(stats.total_revenue)}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Bottom Grid ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Recent Appointments */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                        Recent Appointments
                    </h2>

                    <div className="space-y-1 max-h-72 overflow-y-auto">
                        {recentAppointments.length === 0 ? (
                            <p className="text-xs text-zinc-600 text-center py-4">
                                No appointments yet
                            </p>
                        ) : recentAppointments.map(appt => (
                            <div key={appt.id}
                                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-zinc-800/50 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-white truncate">
                                        {appt.client.name}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 truncate">
                                        {appt.service.name} · {formatDateTime(appt.starts_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {appt.payment && (
                                        <Badge className={`text-[9px] ${
                                            appt.payment.status === 'paid'
                                                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800'
                                                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                        }`}>
                                            {appt.payment.status === 'paid' ? '₱ paid' : '₱ pending'}
                                        </Badge>
                                    )}
                                    <Badge className={`text-[9px] ${statusStyles[appt.status]}`}>
                                        {appt.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notification Logs */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest">
                            Notification Logs
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                <Bell size={10} />
                                {stats.notifications_sent} sent
                            </span>
                            {stats.notifications_failed > 0 && (
                                <span className="flex items-center gap-1 text-[10px] text-red-400">
                                    <BellOff size={10} />
                                    {stats.notifications_failed} failed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1 max-h-72 overflow-y-auto">
                        {recentNotifications.length === 0 ? (
                            <p className="text-xs text-zinc-600 text-center py-4">
                                No notifications sent yet
                            </p>
                        ) : recentNotifications.map(log => (
                            <div key={log.id}
                                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-zinc-800/50">
                                <div className="shrink-0">
                                    {log.status === 'sent'
                                        ? <CheckCircle size={12} className="text-emerald-500" />
                                        : log.status === 'failed'
                                        ? <XCircle size={12} className="text-red-500" />
                                        : <AlertCircle size={12} className="text-yellow-500" />
                                    }
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-white truncate">
                                        {log.user?.name ?? 'Unknown'}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 truncate">
                                        {log.type.replace(/_/g, ' ')} · {log.channel}
                                    </p>
                                </div>
                                <span className="text-[9px] text-zinc-600 shrink-0">
                                    {log.sent_at
                                        ? new Date(log.sent_at).toLocaleDateString('en-PH', {
                                            month: 'short', day: 'numeric',
                                            hour: 'numeric', minute: '2-digit', hour12: true
                                          })
                                        : '—'
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}