import AdminLayout from '@/layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { CalendarAppointment } from '@/types';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
    appointments:  CalendarAppointment[];
    currentView:   'day' | 'week' | 'month';
    currentDate:   string;
}

// ─── Status Colors ─────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
    pending:   'bg-yellow-900/40 text-yellow-300 border-yellow-700',
    confirmed: 'bg-emerald-900/40 text-emerald-300 border-emerald-700',
    cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700',
    completed: 'bg-blue-900/40 text-blue-300 border-blue-700',
    no_show:   'bg-red-900/40 text-red-300 border-red-700',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-PH', {
        hour:   'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatDateHeader(iso: string): string {
    return new Date(iso).toLocaleDateString('en-PH', {
        weekday: 'short',
        month:   'short',
        day:     'numeric',
    });
}

function getWeekDays(dateStr: string): Date[] {
    const date  = new Date(dateStr);
    const day   = date.getDay(); // 0 = Sunday
    const start = new Date(date);
    start.setDate(date.getDate() - day); // go to Sunday

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
}

function toDateString(date: Date): string {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
}

function isSameDay(iso: string, date: Date): boolean {
    const apptDate = new Date(iso);
    return apptDate.getFullYear() === date.getFullYear()
        && apptDate.getMonth()    === date.getMonth()
        && apptDate.getDate()     === date.getDate();
}

function getMonthDays(dateStr: string): (Date | null)[] {
    const date       = new Date(dateStr);
    const year       = date.getFullYear();
    const month      = date.getMonth();
    const firstDay   = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Blank slots para sa days bago mag-start ng month
    const blanks = Array.from({ length: firstDay }, () => null);
    const days   = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

    return [...blanks, ...days];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CalendarIndex({ appointments, currentView, currentDate }: Props) {

    // Navigate to a different date or view
    function navigate(date: string, view?: string) {
        router.get('/admin/calendar', {
            date,
            view: view ?? currentView,
        }, { preserveState: true });
    }

    // Move forward or backward
    function shift(direction: 'prev' | 'next') {
        const date   = new Date(currentDate);
        const amount = direction === 'next' ? 1 : -1;

        if (currentView === 'day') {
            date.setDate(date.getDate() + amount);
        } else if (currentView === 'week') {
            date.setDate(date.getDate() + (amount * 7));
        } else {
            date.setMonth(date.getMonth() + amount);
        }

        navigate(toDateString(date));
    }

    function goToday() {
        navigate(toDateString(new Date()));
    }

    // ── Header label ────────────────────────────────────────────────────────
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
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin',    href: '/admin/dashboard' },
                { label: 'Calendar' },
            ]}
        >
            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-5">
                {/* View switcher */}
                <div className="flex rounded overflow-hidden border border-zinc-700">
                    {(['day', 'week', 'month'] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => navigate(currentDate, v)}
                            className={`px-4 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                                currentView === v
                                    ? 'bg-white text-black'
                                    : 'bg-transparent text-zinc-400 hover:text-white'
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={goToday}
                        className="text-xs text-zinc-400 hover:text-white uppercase tracking-widest"
                    >
                        Today
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost"
                            className="h-7 w-7 text-zinc-400 hover:text-white"
                            onClick={() => shift('prev')}>
                            <ChevronLeft size={14} />
                        </Button>
                        <span className="text-sm text-white min-w-52 text-center">
                            {getHeaderLabel()}
                        </span>
                        <Button size="icon" variant="ghost"
                            className="h-7 w-7 text-zinc-400 hover:text-white"
                            onClick={() => shift('next')}>
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>

                {/* Appointment count */}
                <span className="text-xs text-zinc-500">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* ── Views ───────────────────────────────────────────────── */}
            {currentView === 'day'   && <DayView   appointments={appointments} currentDate={currentDate} />}
            {currentView === 'week'  && <WeekView  appointments={appointments} currentDate={currentDate} onDayClick={(d) => navigate(d, 'day')} />}
            {currentView === 'month' && <MonthView appointments={appointments} currentDate={currentDate} onDayClick={(d) => navigate(d, 'day')} />}

        </AdminLayout>
    );
}

// ─── Day View ──────────────────────────────────────────────────────────────────

function DayView({ appointments, currentDate }: {
    appointments: CalendarAppointment[];
    currentDate: string;
}) {
    const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7AM to 7PM

    return (
        <div className="border border-zinc-800 rounded overflow-hidden">
            {/* Time grid */}
            {hours.map(hour => {
                const hourAppts = appointments.filter(appt => {
                    const apptHour = new Date(appt.starts_at).getHours();
                    return apptHour === hour;
                });

                const label = hour < 12 ? `${hour}:00 AM`
                    : hour === 12 ? '12:00 PM'
                    : `${hour - 12}:00 PM`;

                return (
                    <div key={hour} className="flex border-b border-zinc-800/50 min-h-[56px]">
                        {/* Time label */}
                        <div className="w-20 px-3 py-2 text-[10px] text-zinc-600 border-r border-zinc-800 shrink-0 pt-2">
                            {label}
                        </div>

                        {/* Appointments in this hour */}
                        <div className="flex-1 p-1.5 flex flex-wrap gap-1.5">
                            {hourAppts.map(appt => (
                                <AppointmentCard key={appt.id} appt={appt} />
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
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-zinc-800">
                {weekDays.map((day, i) => {
                    const dateStr  = toDateString(day);
                    const isToday  = dateStr === today;
                    const dayAppts = appointments.filter(a => isSameDay(a.starts_at, day));

                    return (
                        <button
                            key={i}
                            onClick={() => onDayClick(dateStr)}
                            className={`p-3 text-left border-r border-zinc-800 last:border-r-0 hover:bg-zinc-900/50 transition-colors ${
                                isToday ? 'bg-zinc-900' : ''
                            }`}
                        >
                            <p className={`text-[10px] uppercase tracking-widest ${
                                isToday ? 'text-white' : 'text-zinc-500'
                            }`}>
                                {day.toLocaleDateString('en-PH', { weekday: 'short' })}
                            </p>
                            <p className={`text-lg font-bold mt-0.5 ${
                                isToday ? 'text-white' : 'text-zinc-400'
                            }`}>
                                {day.getDate()}
                            </p>
                            {dayAppts.length > 0 && (
                                <span className="text-[10px] text-zinc-500">
                                    {dayAppts.length} appt{dayAppts.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Appointments per day */}
            <div className="grid grid-cols-7 min-h-[300px]">
                {weekDays.map((day, i) => {
                    const dayAppts = appointments
                        .filter(a => isSameDay(a.starts_at, day))
                        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

                    return (
                        <div key={i} className="p-1.5 border-r border-zinc-800 last:border-r-0 space-y-1">
                            {dayAppts.map(appt => (
                                <AppointmentCard key={appt.id} appt={appt} compact />
                            ))}
                        </div>
                    );
                })}
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
    const days  = getMonthDays(currentDate);
    const today = toDateString(new Date());
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="border border-zinc-800 rounded overflow-hidden">
            {/* Day of week headers */}
            <div className="grid grid-cols-7 border-b border-zinc-800">
                {dayLabels.map(d => (
                    <div key={d} className="px-3 py-2 text-[10px] text-zinc-500 uppercase tracking-widest border-r border-zinc-800 last:border-r-0">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7">
                {days.map((day, i) => {
                    if (! day) {
                        // Blank cell para sa days bago mag-start ng month
                        return <div key={`blank-${i}`} className="border-r border-b border-zinc-800 min-h-[100px]" />;
                    }

                    const dateStr  = toDateString(day);
                    const isToday  = dateStr === today;
                    const dayAppts = appointments.filter(a => isSameDay(a.starts_at, day));

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDayClick(dateStr)}
                            className={`min-h-[100px] p-2 text-left border-r border-b border-zinc-800 last:border-r-0 hover:bg-zinc-900/40 transition-colors align-top ${
                                isToday ? 'bg-zinc-900/60' : ''
                            }`}
                        >
                            <span className={`text-xs font-medium ${
                                isToday ? 'text-white' : 'text-zinc-400'
                            }`}>
                                {day.getDate()}
                            </span>

                            <div className="mt-1 space-y-0.5">
                                {/* Show max 3 appointments, then "+N more" */}
                                {dayAppts.slice(0, 3).map(appt => (
                                    <div
                                        key={appt.id}
                                        className={`text-[9px] px-1.5 py-0.5 rounded truncate border ${statusColors[appt.status]}`}
                                    >
                                        {formatTime(appt.starts_at)} {appt.service_name}
                                    </div>
                                ))}
                                {dayAppts.length > 3 && (
                                    <div className="text-[9px] text-zinc-500 px-1">
                                        +{dayAppts.length - 3} more
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Appointment Card ──────────────────────────────────────────────────────────
// Reusable card — ginagamit sa lahat ng views

function AppointmentCard({ appt, compact = false }: {
    appt: CalendarAppointment;
    compact?: boolean;
}) {
    return (
        <div className={`rounded border px-2 py-1.5 ${statusColors[appt.status]} ${
            compact ? 'text-[9px]' : 'text-xs'
        }`}>
            <p className="font-medium truncate">{appt.service_name}</p>
            {! compact && (
                <>
                    <p className="opacity-75 truncate">{appt.client_name}</p>
                    <p className="opacity-75 truncate">with {appt.staff_name}</p>
                </>
            )}
            <p className="opacity-60 mt-0.5">
                {formatTime(appt.starts_at)}
                {! compact && ` — ${formatTime(appt.ends_at)}`}
            </p>
        </div>
    );
}