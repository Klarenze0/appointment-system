import AdminLayout from '@/layouts/AdminLayout';
import { StaffProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Trash2, ToggleLeft, ToggleRight, Save, Pencil } from 'lucide-react';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

interface AvailabilitySlot {
    id: number;
    staff_id: number;
    available_date: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface NewSlot {
    date: string;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface Props {
    staff: StaffProfile & { user: { name: string; email: string } };
    availabilities: AvailabilitySlot[];
    flash?: { success?: string; error?: string };
}

function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
        weekday: 'short',
        month:   'short',
        day:     'numeric',
        year:    'numeric',
    });
}

export default function AvailabilityIndex({ staff, availabilities, flash }: Props) {

    // Ang isang calendar lang — kapag nag-click ng date,
    // nagda-dagdag ng bagong slot sa list
    const [selectedDates, setSelectedDates] = useState<NewSlot[]>([]);

    const newSlotsForm = useForm<{ availabilities: NewSlot[] }>({
        availabilities: [],
    });

    const editForm = useForm({
        date:       '',
        start_time: '',
        end_time:   '',
        is_active:  true,
    });
    const [editingSlot, setEditingSlot] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        date:       '',
        start_time: '',
        end_time:   '',
        is_active:  true,
    });

    // Kapag nag-click ng date sa calendar
    function handleDateSelect(date: Date | undefined) {
        if (!date) return;

        const dateStr = date.toLocaleDateString('en-CA'); // YYYY-MM-DD

        // Kapag nandoon na ang date sa list, alisin (toggle off)
        const exists = selectedDates.find(s => s.date === dateStr);
        if (exists) {
            setSelectedDates(selectedDates.filter(s => s.date !== dateStr));
            return;
        }

        // Idagdag ang bagong date sa list na may default na times
        setSelectedDates([...selectedDates, {
            date:       dateStr,
            start_time: '09:00',
            end_time:   '17:00',
            is_active:  true,
        }]);
    }

    // I-update ang time o is_active ng isang slot sa list
    function updateSlot(date: string, field: keyof NewSlot, value: any) {
        setSelectedDates(selectedDates.map(s =>
            s.date === date ? { ...s, [field]: value } : s
        ));
    }

    // Alisin ang isang slot mula sa list
    function removeSlot(date: string) {
        setSelectedDates(selectedDates.filter(s => s.date !== date));
    }

    // I-sort ang slots by date para sa display
    const sortedSlots = [...selectedDates].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (selectedDates.length === 0) return;

        newSlotsForm.transform(() => ({
            availabilities: selectedDates,
        }));

        newSlotsForm.post(`/admin/staff/${staff.id}/availability`, {
            onSuccess: () => {
                setSelectedDates([]);
                newSlotsForm.reset();
            },
        });
    }

    function handleToggle(availabilityId: number) {
        router.patch(`/admin/staff/${staff.id}/availability/${availabilityId}/toggle`);
    }

    function handleDelete(availabilityId: number) {
        if (confirm('Remove this availability slot?')) {
            router.delete(`/admin/staff/${staff.id}/availability/${availabilityId}`);
        }
    }

    function handleEdit(slot: AvailabilitySlot) {
        setEditingSlot(slot.id);
        editForm.setData({
            date:       slot.available_date,
            start_time: slot.start_time.slice(0, 5),
            end_time:   slot.end_time.slice(0, 5),
            is_active:  slot.is_active,
        });
    }

    function handleEditSubmit(staffId: number, availabilityId: number) {
        editForm.patch(
            `/admin/staff/${staffId}/availability/${availabilityId}`,
            {
                onSuccess: () => setEditingSlot(null),
            }
        );
    }

    // Dates na may existing slots na — naka-disabled sa calendar
    const existingDates = availabilities.map(a => new Date(a.available_date + 'T00:00:00'));

    // Dates na naka-selected sa bagong form — para ma-highlight sa calendar
    const newlySelectedDates = selectedDates.map(s => new Date(s.date + 'T00:00:00'));

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin',         href: '/admin/dashboard' },
                { label: 'Staff',         href: '/admin/staff' },
                { label: staff.user.name, href: `/admin/staff/${staff.id}/edit` },
                { label: 'Availability' },
            ]}
        >
            {flash?.success && (
                <div className="mb-4 text-xs text-emerald-400 border border-emerald-800 bg-emerald-950/50 px-4 py-2 rounded">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 text-xs text-red-400 border border-red-900 bg-red-950/40 px-4 py-2 rounded">
                    {flash.error}
                </div>
            )}

            <div className="max-w-4xl space-y-8">

                {/* ── Existing Slots ──────────────────────────────────── */}
                <div>
                    <h2 className="text-sm font-semibold text-white mb-3 uppercase tracking-widest">
                        Current Schedule — {staff.user.name}
                    </h2>

                    {availabilities.length === 0 ? (
                        <p className="text-xs text-zinc-600 border border-zinc-800 rounded px-4 py-8 text-center">
                            No availability set yet. Add slots below.
                        </p>
                    ) : (
                        <div className="border border-zinc-800 rounded overflow-hidden">
                            <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                        <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Date</th>
                                        <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Start</th>
                                        <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">End</th>
                                        <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Status</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availabilities.map((slot) => (
                                        <tr key={slot.id} className="border-b border-zinc-800/50">

                                            {/* ── View mode ─────────────────────────────────── */}
                                            {editingSlot !== slot.id ? (
                                                <>
                                                    <td className="px-4 py-3 text-white font-medium">
                                                        {formatDate(slot.available_date)}
                                                    </td>
                                                    <td className="px-4 py-3 text-zinc-300">{formatTime(slot.start_time)}</td>
                                                    <td className="px-4 py-3 text-zinc-300">{formatTime(slot.end_time)}</td>
                                                    <td className="px-4 py-3">
                                                        {slot.is_active ? (
                                                            <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]">Active</Badge>
                                                        ) : (
                                                            <Badge className="bg-zinc-900 text-zinc-500 border-zinc-700 text-[10px]">Inactive</Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2 justify-end">
                                                            {/* Edit button */}
                                                            <Button size="icon" variant="ghost"
                                                                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                                                onClick={() => handleEdit(slot)}
                                                                title="Edit">
                                                                <Pencil size={12} />
                                                            </Button>
                                                            <Button size="icon" variant="ghost"
                                                                className={`h-7 w-7 ${slot.is_active ? 'text-emerald-500 hover:text-zinc-400' : 'text-zinc-600 hover:text-emerald-400'} hover:bg-zinc-800`}
                                                                onClick={() => handleToggle(slot.id)}
                                                                title={slot.is_active ? 'Deactivate' : 'Activate'}>
                                                                {slot.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                            </Button>
                                                            <Button size="icon" variant="ghost"
                                                                className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-950/30"
                                                                onClick={() => handleDelete(slot.id)}>
                                                                <Trash2 size={12} />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                /* ── Edit mode ────────────────────────────────── */
                                                <td colSpan={5} className="px-4 py-3">
                                                    <div className="flex items-end gap-3 flex-wrap">

                                                        {/* Date picker */}
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Date</p>
                                                            <input
                                                                type="date"
                                                                value={editForm.data.date}
                                                                onChange={e => editForm.setData('date', e.target.value)}
                                                                className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-white"
                                                            />
                                                        </div>

                                                        {/* Start time */}
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Start</p>
                                                            <input
                                                                type="time"
                                                                value={editForm.data.start_time}
                                                                onChange={e => editForm.setData('start_time', e.target.value)}
                                                                className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-white"
                                                            />
                                                        </div>

                                                        {/* End time */}
                                                        <div className="space-y-1">
                                                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">End</p>
                                                            <input
                                                                type="time"
                                                                value={editForm.data.end_time}
                                                                onChange={e => editForm.setData('end_time', e.target.value)}
                                                                className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-white"
                                                            />
                                                        </div>

                                                        {/* Active toggle */}
                                                        <label className="flex items-center gap-1.5 cursor-pointer mb-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={editForm.data.is_active}   
                                                                onChange={e => editForm.setData('is_active', e.target.checked)}
                                                                className="accent-white w-3.5 h-3.5"
                                                            />
                                                            <span className="text-[9px] text-zinc-400 uppercase tracking-widest">Active</span>
                                                        </label>

                                                        {/* Save + Cancel */}
                                                        <div className="flex gap-2 mb-1">
                                                            <Button size="sm"
                                                                className="h-7 text-[10px] bg-white text-black hover:bg-zinc-200 gap-1"
                                                                onClick={() => handleEditSubmit(staff.id, slot.id)}>
                                                                <Save size={10} />
                                                                Save
                                                            </Button>
                                                            <Button size="sm" variant="ghost"
                                                                className="h-7 text-[10px] text-zinc-400 hover:text-white"
                                                                onClick={() => setEditingSlot(null)}>
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Add New Slots ────────────────────────────────────── */}
                <div>
                    <h2 className="text-sm font-semibold text-white mb-3 uppercase tracking-widest">
                        Add New Slots
                    </h2>
                    <p className="text-xs text-zinc-500 mb-4">
                        Click dates on the calendar to add them. Click again to remove.
                    </p>

                    <form onSubmit={submit}>
                        <div className="flex gap-6 items-start">

                            {/* ── Isang Calendar lang ──────────────────── */}
                            <div className="border border-zinc-700 rounded-lg p-3 bg-zinc-900 shrink-0">
                                <Calendar
                                    mode="multiple"
                                    selected={newlySelectedDates}
                                    onSelect={(dates) => {
                                        if (!dates) {
                                            setSelectedDates([]);
                                            return;
                                        }
                                        // I-sync ang selectedDates sa bagong selection
                                        const newDateStrs = dates.map(d => d.toLocaleDateString('en-CA'));
                                        setSelectedDates(prev => {
                                            // Idagdag ang mga bagong dates
                                            const added = newDateStrs
                                                .filter(d => !prev.find(s => s.date === d))
                                                .map(d => ({
                                                    date:       d,
                                                    start_time: '09:00',
                                                    end_time:   '17:00',
                                                    is_active:  true,
                                                }));
                                            // Alisin ang mga na-deselect
                                            const kept = prev.filter(s => newDateStrs.includes(s.date));
                                            return [...kept, ...added];
                                        });
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (date < today) return true;
                                        // I-disable ang dates na may existing slots na
                                        return existingDates.some(
                                            d => d.toDateString() === date.toDateString()
                                        );
                                    }}
                                    className="text-white"
                                />
                            </div>

                            {/* ── Slots List sa tabi ng calendar ───────── */}
                            <div className="flex-1 min-w-0">
                                {selectedDates.length === 0 ? (
                                    <div className="border border-dashed border-zinc-700 rounded-lg px-4 py-10 text-center">
                                        <p className="text-xs text-zinc-600">
                                            No dates selected yet.
                                        </p>
                                        <p className="text-xs text-zinc-700 mt-1">
                                            Click dates on the calendar to add slots.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {sortedSlots.map((slot) => (
                                            <div key={slot.date}
                                                className="border border-zinc-800 rounded-lg px-3 py-3 bg-zinc-900/40">

                                                {/* Date label */}
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <p className="text-xs font-medium text-white">
                                                        {formatDate(slot.date)}
                                                    </p>
                                                    <Button type="button" size="icon" variant="ghost"
                                                        className="h-6 w-6 text-zinc-600 hover:text-red-400 hover:bg-red-950/30"
                                                        onClick={() => removeSlot(slot.date)}>
                                                        <Trash2 size={10} />
                                                    </Button>
                                                </div>

                                                {/* Time inputs */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">Start</p>
                                                        <input
                                                            type="time"
                                                            value={slot.start_time}
                                                            onChange={e => updateSlot(slot.date, 'start_time', e.target.value)}
                                                            className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest">End</p>
                                                        <input
                                                            type="time"
                                                            value={slot.end_time}
                                                            onChange={e => updateSlot(slot.date, 'end_time', e.target.value)}
                                                            className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-white"
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-1.5 cursor-pointer mt-3.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={slot.is_active}
                                                            onChange={e => updateSlot(slot.date, 'is_active', e.target.checked)}
                                                            className="accent-white w-3.5 h-3.5"
                                                        />
                                                        <span className="text-[9px] text-zinc-400 uppercase tracking-widest">Active</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Save button */}
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={newSlotsForm.processing || selectedDates.length === 0}
                                            className="w-full mt-2 bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-widest gap-1.5"
                                        >
                                            <Save size={11} />
                                            Save {selectedDates.length} Slot{selectedDates.length !== 1 ? 's' : ''}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}