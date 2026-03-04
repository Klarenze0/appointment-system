import ClientLayout from '@/layouts/ClientLayout';
import { useForm } from '@inertiajs/react';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from '@/components/ui/calendar';

interface StaffOption {
    id: number;
    user: { name: string };
}

interface SlotOption {
    starts_at: string;
    ends_at: string;
    display_time: string;
}

interface Props {
    services: (Service & { staff: StaffOption[] })[];
    flash?: { success?: string; error?: string };
}

export default function BookAppointment({ services, flash }: Props) {

    const [selectedService, setSelectedService] = useState<(Service & { staff: StaffOption[] }) | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<StaffOption | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState<SlotOption[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [availableDates, setAvailableDates]       = useState<string[]>([]);
    const [loadingDates, setLoadingDates]           = useState(false);
    const [calendarMonth, setCalendarMonth]         = useState<Date>(new Date());

    const { data, setData, post, processing, errors } = useForm({
        service_id: '' as number | string,
        staff_id: '' as number | string,
        starts_at: '',
    });

    // Kapag nag-change ang service, i-reset ang staff at slots
    function handleServiceChange(serviceId: number) {
        const service = services.find(s => s.id === serviceId) ?? null;
        setSelectedService(service);
        setSelectedStaff(null);
        setSelectedDate('');
        setSlots([]);
        setData({ service_id: serviceId, staff_id: '', starts_at: '' });
    }

    // Kapag nag-change ang staff, i-reset ang date at slots
    function handleStaffChange(staffId: number) {
        const staff = selectedService?.staff.find(s => s.id === staffId) ?? null;
        setSelectedStaff(staff);
        setSelectedDate('');
        setSlots([]);
        setData('staff_id', staffId);
        setData('starts_at', '');

        if (data.service_id && staffId) {
            fetchAvailableDates(Number(data.service_id), staffId, calendarMonth);
        }
    }

    // Kapag nag-change ang date, kumuha ng available slots via AJAX
    async function handleDateChange(date: string) {
        setSelectedDate(date);
        setSlots([]);
        setData('starts_at', '');

        if (!data.service_id || !data.staff_id || !date) return;

        setLoadingSlots(true);
        try {
            const response = await axios.get('/appointments/slots', {
                params: {
                    service_id: data.service_id,
                    staff_id: data.staff_id,
                    date,
                },
            });
            setSlots(response.data.slots);
        } catch {
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }

    async function fetchAvailableDates(staffId: number, serviceId: number, month: Date) {
        setLoadingDates(true);
        setAvailableDates([]);
        try {
            const response = await axios.get('/appointments/available-dates', {
                params: {
                    staff_id:   staffId,
                    service_id: serviceId,
                    month:      month.getMonth() + 1,
                    year:       month.getFullYear(),
                },
            });
            setAvailableDates(response.data.dates);
        } catch {
            setAvailableDates([]);
        } finally {
            setLoadingDates(false);
        }
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        post('/appointments');
    }


    return (
        <ClientLayout title="Book an Appointment">
            {flash?.error && (
                <div className="mb-4 text-sm text-red-700 border border-red-200 bg-red-50 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )}

            <form onSubmit={submit} className="max-w-lg space-y-6">

                {/* ── Step 1: Service ──────────────────────────────────── */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                        1. Select Service
                    </label>
                    <div className="grid gap-2">
                        {services.map(service => (
                            <button
                                key={service.id}
                                type="button"
                                onClick={() => handleServiceChange(service.id)}
                                className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${selectedService?.id === service.id
                                        ? 'border-zinc-900 bg-zinc-900 text-white'
                                        : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                                    }`}
                            >
                                <span className="font-medium">{service.name}</span>
                                <span className="ml-3 text-xs opacity-60">
                                    {service.duration_minutes}min · ${Number(service.price).toFixed(2)}
                                </span>
                            </button>
                        ))}
                    </div>
                    {errors.service_id && <p className="text-xs text-red-500">{errors.service_id}</p>}
                </div>

                {/* ── Step 2: Staff ─────────────────────────────────────── */}
                {selectedService && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                            2. Select Staff
                        </label>
                        <div className="grid gap-2">
                            {selectedService.staff.map(staff => (
                                <button
                                    key={staff.id}
                                    type="button"
                                    onClick={() => handleStaffChange(staff.id)}
                                    className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${selectedStaff?.id === staff.id
                                            ? 'border-zinc-900 bg-zinc-900 text-white'
                                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                                        }`}
                                >
                                    {staff.user.name}
                                </button>
                            ))}
                        </div>
                        {errors.staff_id && <p className="text-xs text-red-500">{errors.staff_id}</p>}
                    </div>
                )}

                {/* ── Step 3: Date ──────────────────────────────────────── */}
                {selectedStaff && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                            3. Select Date
                        </label>

                        {loadingDates && (
                            <p className="text-xs text-zinc-400">Loading available dates...</p>
                        )}

                        {!loadingDates && availableDates.length === 0 && selectedStaff && (
                            <p className="text-xs text-zinc-500 border border-zinc-200 rounded-lg px-4 py-3">
                                No available dates this month for this staff. Try changing the month.
                            </p>
                        )}

                        <div className="border border-zinc-200 rounded-lg p-3 bg-white inline-block">
                            <Calendar
                                mode="single"
                                month={calendarMonth}
                                onMonthChange={(month) => {
                                    setCalendarMonth(month);
                                    // Kapag nag-change ng month, i-fetch ulit ang available dates
                                    if (data.service_id && data.staff_id) {
                                        fetchAvailableDates(
                                            Number(data.service_id),
                                            Number(data.staff_id),
                                            month
                                        );
                                    }
                                }}
                                selected={selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined}
                                onSelect={(date) => {
                                    if (!date) return;
                                    const formatted = date.toLocaleDateString('en-CA');
                                    handleDateChange(formatted);
                                }}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    if (date < today) return true;

                                    // I-disable ang dates na wala sa availableDates list
                                    const dateStr = date.toLocaleDateString('en-CA');
                                    return !availableDates.includes(dateStr);
                                }}
                                modifiers={{
                                    // Available dates — green dot ang ipapakita
                                    available: availableDates.map(d => new Date(d + 'T00:00:00')),
                                }}
                                modifiersClassNames={{
                                    available: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-green-500 after:rounded-full',
                                }}
                                className="text-zinc-900"
                            />
                        </div>

                        {!loadingDates && availableDates.length > 0 && (
                            <p className="text-xs text-zinc-400">
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                                Green dot = available dates
                            </p>
                        )}
                    </div>
                )}

                {/* ── Step 4: Time Slot ─────────────────────────────────── */}
                {selectedDate && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                            4. Select Time
                        </label>

                        {loadingSlots && (
                            <p className="text-xs text-zinc-400">Loading available times...</p>
                        )}

                        {!loadingSlots && slots.length === 0 && (
                            <p className="text-xs text-zinc-400 border border-zinc-200 rounded-lg px-4 py-3">
                                No available slots on this date. Try another day.
                            </p>
                        )}

                        {!loadingSlots && slots.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {slots.map(slot => (
                                    <button
                                        key={slot.starts_at}
                                        type="button"
                                        onClick={() => setData('starts_at', slot.starts_at)}
                                        className={`px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${data.starts_at === slot.starts_at
                                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                                            }`}
                                    >
                                        {slot.display_time}
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.starts_at && <p className="text-xs text-red-500">{errors.starts_at}</p>}
                    </div>
                )}

                {/* ── Submit ────────────────────────────────────────────── */}
                {data.starts_at && (
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-700 text-sm"
                    >
                        {processing ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                )}

            </form>
        </ClientLayout>
    );
}