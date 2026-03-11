import AdminLayout from '@/layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { CalendarAppointment } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    appointments:  CalendarAppointment[];
    currentView:   'day' | 'week' | 'month';
    currentDate:   string;
}

const statusColors: Record<string, string> = {
    pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    confirmed: 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
    cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
    completed: 'bg-blue-900/40 text-blue-300 border-blue-700',
    no_show:   'bg-red-900/40 text-red-300 border-red-700',
};

const statusLabels: Record<string, string> = {
    pending:   '🟡 Pending',
    confirmed: '🟢 Confirmed',
    cancelled: '⚫ Cancelled',
    completed: '🔵 Completed',
    no_show:   '🔴 No Show',
};

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-PH', {
        hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

function getWeekDays(dateStr: string): Date[] {
    const date  = new Date(dateStr);
    const day   = date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
}

function toDateString(date: Date): string {
    return date.toLocaleDateString('en-CA');
}

function isSameDay(iso: string, date: Date): boolean {
    const apptDate = new Date(iso);
    return apptDate.getFullYear() === date.getFullYear()
        && apptDate.getMonth()    === date.getMonth()
        && apptDate.getDate()     === date.getDate();
}

function getMonthDays(dateStr: string): (Date | null)[] {
    const date        = new Date(dateStr);
    const year        = date.getFullYear();
    const month       = date.getMonth();
    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const blanks      = Array.from({ length: firstDay }, () => null);
    const days        = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    return [...blanks, ...days];
}

export default function CalendarIndex({ appointments, currentView, currentDate }: Props) {

    function navigate(date: string, view?: string) {
        router.get('/admin/calendar', {
            date,
            view: view ?? currentView,
        }, { preserveState: true });
    }

    function shift(direction: 'prev' | 'next') {
        const date   = new Date(currentDate);
        const amount = direction === 'next' ? 1 : -1;
        if (currentView === 'day')        date.setDate(date.getDate() + amount);
        else if (currentView === 'week')  date.setDate(date.getDate() + (amount * 7));
        else                              date.setMonth(date.getMonth() + amount);
        navigate(toDateString(date));
    }

    function getHeaderLabel(): string {
        const date = new Date(currentDate);
        if (currentView === 'day') {
            return date.toLocaleDateString('en-PH', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
            });
        }
        if (currentView === 'week') {
            const days  = getWeekDays(currentDate);
            const start = days[0].toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
            const end   = days[6].toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
            return `${start} — ${end}`;
        }
        return date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
    }

    return (
        <AdminLayout breadcrumbs={[
            { label: 'Admin', href: '/admin/dashboard' },
            { label: 'Calendar' },
        ]}>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex rounded overflow-hidden border border-zinc-700">
                    {(['day', 'week', 'month'] as const).map(v => (
                        <button key={v} onClick={() => navigate(currentDate, v)}
                            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                                currentView === v ? 'bg-white text-black' : 'bg-transparent text-zinc-400 hover:text-white'
                            }`}>
                            {v}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <Button size="sm" variant="ghost" onClick={() => navigate(toDateString(new Date()))}
                        className="text-xs text-zinc-400 hover:text-white uppercase tracking-widest">
                        Today
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-white"
                            onClick={() => shift('prev')}>
                            <ChevronLeft size={14} />
                        </Button>
                        <span className="text-sm text-white min-w-52 text-center">{getHeaderLabel()}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-white"
                            onClick={() => shift('next')}>
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>

                <span className="text-xs text-zinc-500">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Legend */}
            <div className="flex gap-3 mb-4 flex-wrap">
                {Object.entries(statusLabels).map(([status, label]) => (
                    <span key={status} className={`text-[10px] px-2 py-0.5 rounded border ${statusColors[status]}`}>
                        {label}
                    </span>
                ))}
            </div>

            {currentView === 'day'   && <DayView   appointments={appointments} currentDate={currentDate} />}
            {currentView === 'week'  && <WeekView  appointments={appointments} currentDate={currentDate} onDayClick={(d) => navigate(d, 'day')} />}
            {currentView === 'month' && <MonthView appointments={appointments} currentDate={currentDate} onDayClick={(d) => navigate(d, 'day')} />}
        </AdminLayout>
    );
}

// ─── Appointment Card ──────────────────────────────────────────────────────────

function AppointmentCard({ appt, compact = false }: { appt: CalendarAppointment; compact?: boolean }) {

    function handleAction(e: React.MouseEvent, action: () => void) {
        e.stopPropagation(); // prevent day click from firing
        action();
    }

    function confirm_(id: number) {
        if (confirm('Confirm this appointment?'))
            router.patch(`/admin/appointments/${id}/confirm`, {}, {
                onSuccess: () => router.reload(),
            });
    }

    function complete(id: number) {
        if (confirm('Mark as completed?'))
            router.patch(`/admin/appointments/${id}/complete`, {}, {
                onSuccess: () => router.reload(),
            });
    }

    function noShow(id: number) {
        if (confirm('Mark as no-show?'))
            router.patch(`/admin/appointments/${id}/no-show`, {}, {
                onSuccess: () => router.reload(),
            });
    }

    function cancel(id: number) {
        if (confirm('Cancel this appointment? If paid, a refund will be issued.'))
            router.patch(`/admin/appointments/${id}/cancel`, {}, {
                onSuccess: () => router.reload(),
            });
    }

    const canAct = ['pending', 'confirmed'].includes(appt.status);

    return (
        <div className={`rounded px-2 py-1.5 text-[10px] border-l-2 ${statusColors[appt.status]}`}>
            {/* Always visible */}
            <p className="font-semibold truncate">{appt.client_name}</p>
            <p className="truncate opacity-80">{appt.service_name}</p>
            <p className="opacity-60 font-mono">{formatTime(appt.starts_at)}</p>

            {/* Full info — day view only */}
            {!compact && (
                <>
                    <p className="opacity-60 mt-0.5">{appt.staff_name}</p>
                    <p className={`text-[9px] mt-1 px-1 py-0.5 rounded inline-block border ${statusColors[appt.status]}`}>
                        {statusLabels[appt.status]}
                    </p>
                </>
            )}

            {/* Action buttons — day view only, only for actionable statuses */}
            {!compact && canAct && (
                <div className="flex gap-1 mt-2 flex-wrap">
                    {appt.status === 'pending' && (
                        <button onClick={(e) => handleAction(e, () => confirm_(appt.id))}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-800/60 text-emerald-300 hover:bg-emerald-700/80 border border-emerald-700">
                            ✓ Confirm
                        </button>
                    )}
                    {appt.status === 'confirmed' && (
                        <button onClick={(e) => handleAction(e, () => complete(appt.id))}
                            className="px-1.5 py-0.5 rounded text-[9px] bg-blue-800/60 text-blue-300 hover:bg-blue-700/80 border border-blue-700">
                            ✓ Complete
                        </button>
                    )}
                    <button onClick={(e) => handleAction(e, () => noShow(appt.id))}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-orange-800/60 text-orange-300 hover:bg-orange-700/80 border border-orange-700">
                        No Show
                    </button>
                    <button onClick={(e) => handleAction(e, () => cancel(appt.id))}
                        className="px-1.5 py-0.5 rounded text-[9px] bg-red-800/60 text-red-300 hover:bg-red-700/80 border border-red-700">
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Day View ──────────────────────────────────────────────────────────────────

function DayView({ appointments, currentDate }: {
    appointments: CalendarAppointment[];
    currentDate: string;
}) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 7);

    return (
        <div className="border border-zinc-800 rounded overflow-hidden">
            {hours.map(hour => {
                const hourAppts = appointments.filter(a => new Date(a.starts_at).getHours() === hour);
                const label = hour < 12 ? `${hour}:00 AM`
                    : hour === 12 ? '12:00 PM'
                    : `${hour - 12}:00 PM`;

                return (
                    <div key={hour} className="flex border-b border-zinc-800/50 min-h-[64px]">
                        <div className="w-20 px-3 py-2 text-[10px] text-zinc-600 border-r border-zinc-800 shrink-0">
                            {label}
                        </div>
                        <div className="flex-1 p-1.5 flex flex-wrap gap-1.5 content-start">
                            {hourAppts.map(appt => (
                                <div key={appt.id} className="w-full">
                                    <AppointmentCard appt={appt} compact={false} />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Week View ─────────────────────────────────────────────────────────────────

function WeekView({ appointments, currentDate, onDayClick }: {
    appointments: CalendarAppointment[];
    currentDate: string;
    onDayClick: (date: string) => void;
}) {
    const weekDays = getWeekDays(currentDate);
    const today    = toDateString(new Date());

    return (
        <div className="border border-zinc-800 rounded overflow-hidden">
            {/* Clickable day headers */}
            <div className="grid grid-cols-7 border-b border-zinc-800">
                {weekDays.map((day, i) => {
                    const dateStr  = toDateString(day);
                    const isToday  = dateStr === today;
                    const dayAppts = appointments.filter(a => isSameDay(a.starts_at, day));

                    return (
                        <button key={i} onClick={() => onDayClick(dateStr)}
                            className={`p-3 text-left border-r border-zinc-800 last:border-r-0 hover:bg-zinc-700/50 transition-colors cursor-pointer ${
                                isToday ? 'bg-zinc-900' : ''
                            }`}>
                            <p className={`text-[10px] uppercase tracking-widest ${isToday ? 'text-white' : 'text-zinc-500'}`}>
                                {day.toLocaleDateString('en-PH', { weekday: 'short' })}
                            </p>
                            <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-white' : 'text-zinc-400'}`}>
                                {day.getDate()}
                            </p>
                            {dayAppts.length > 0 && (
                                <span className="text-[10px] text-zinc-500">
                                    {dayAppts.length} appt{dayAppts.length > 1 ? 's' : ''} →
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Appointments per day — compact, click day to see actions */}
            <div className="grid grid-cols-7 min-h-[300px]">
                {weekDays.map((day, i) => {
                    const dayAppts = appointments
                        .filter(a => isSameDay(a.starts_at, day))
                        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

                    return (
                        <div key={i} className="p-1.5 border-r border-zinc-800 last:border-r-0 space-y-1">
                            {dayAppts.map(appt => (
                                <AppointmentCard key={appt.id} appt={appt} compact={true} />
                            ))}
                        </div>
                    );
                })}
            </div>

            <div className="px-4 py-2 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-600">Click a day header to view details and manage appointments</p>
            </div>
        </div>
    );
}

// ─── Month View ────────────────────────────────────────────────────────────────

function MonthView({ appointments, currentDate, onDayClick }: {
    appointments: CalendarAppointment[];
    currentDate: string;
    onDayClick: (date: string) => void;
}) {
    const days      = getMonthDays(currentDate);
    const today     = toDateString(new Date());
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="border border-zinc-800 rounded overflow-hidden">
            <div className="grid grid-cols-7 border-b border-zinc-800">
                {dayLabels.map(d => (
                    <div key={d} className="px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-widest border-r border-zinc-800 last:border-r-0">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7">
                {days.map((day, i) => {
                    if (!day) return <div key={`blank-${i}`} className="border-r border-b border-zinc-800 min-h-[100px]" />;

                    const dateStr  = toDateString(day);
                    const isToday  = dateStr === today;
                    const dayAppts = appointments.filter(a => isSameDay(a.starts_at, day));

                    return (
                        <button key={dateStr} onClick={() => onDayClick(dateStr)}
                            className={`min-h-[100px] p-2 text-left border-r border-b border-zinc-800 hover:bg-zinc-800/60 transition-colors align-top w-full ${
                                isToday ? 'bg-zinc-900/60' : ''
                            }`}>
                            <span className={`text-xs font-bold ${isToday ? 'text-white' : 'text-zinc-400'}`}>
                                {day.getDate()}
                            </span>

                            <div className="mt-1 space-y-0.5">
                                {dayAppts.slice(0, 3).map(appt => (
                                    <div key={appt.id}
                                        className={`text-[9px] px-1.5 py-0.5 rounded truncate border ${statusColors[appt.status]}`}>
                                        <span className="font-bold">{formatTime(appt.starts_at)}</span>
                                        {' · '}
                                        <span>{appt.client_name}</span>
                                        {' · '}
                                        <span className="opacity-75">{appt.service_name}</span>
                                    </div>
                                ))}
                                {dayAppts.length > 3 && (
                                    <div className="text-[9px] text-zinc-500 px-1">
                                        +{dayAppts.length - 3} more — click to view
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="px-4 py-2 border-t border-zinc-800">
                <p className="text-[10px] text-zinc-600">Click any day to view details and manage appointments</p>
            </div>
        </div>
    );
}