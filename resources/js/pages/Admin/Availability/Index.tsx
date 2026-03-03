import AdminLayout from '@/layouts/AdminLayout';
import { router, useForm } from '@inertiajs/react';
import { StaffProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvailabilitySlot {
    id: number;
    staff_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

interface Props {
    staff: StaffProfile & { user: { name: string; email: string } };
    availabilities: AvailabilitySlot[];
    flash?: { success?: string; error?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
];

// ─── New Slot Form ─────────────────────────────────────────────────────────────

// Ito ang blank template ng isang bagong slot
const blankSlot = () => ({
    day_of_week: 1, // Monday by default
    start_time: '09:00',
    end_time: '17:00',
    is_active: true,
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvailabilityIndex({
    staff,
    availabilities,
    flash,
}: Props) {

    const { data, setData, post, processing, errors, reset } = useForm<{
        availabilities: {
            day_of_week: number;
            start_time: string;
            end_time: string;
            is_active: boolean;
        }[];
    }>({
        availabilities: [blankSlot()],
    });

    // Mag-add ng bagong blank row sa form
    function addSlot() {
        setData('availabilities', [...data.availabilities, blankSlot()]);
    }

    // Mag-remove ng row mula sa form
    function removeSlot(index: number) {
        setData(
            'availabilities',
            data.availabilities.filter((_, i) => i !== index),
        );
    }

    // I-update ang isang specific field ng isang specific row
    function updateSlot(index: number, field: string, value: any) {
        const updated = [...data.availabilities];
        updated[index] = { ...updated[index], [field]: value };
        setData('availabilities', updated);
    }

    // I-submit ang bagong slots
    function submit(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/staff/${staff.id}/availability`, {
            onSuccess: () => reset(),
        });
    }

    // I-toggle ang is_active ng existing slot (saved na sa DB)
    function handleToggle(availabilityId: number) {
        router.patch(
            `/admin/staff/${staff.id}/availability/${availabilityId}/toggle`,
        );
    }

    // Burahin ang existing slot
    function handleDelete(availabilityId: number) {
        if (confirm('Remove this availability slot?')) {
            router.delete(
                `/admin/staff/${staff.id}/availability/${availabilityId}`,
            );
        }
    }

    // Helper: i-convert ang day_of_week number sa label
    function getDayLabel(dayOfWeek: number): string {
        return DAYS.find((d) => d.value === dayOfWeek)?.label ?? 'Unknown';
    }

    // Helper: i-format ang time para mas readable
    // 09:00:00 → 9:00 AM
    function formatTime(time: string): string {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const h = hours % 12 || 12;
        return `${h}:${String(minutes).padStart(2, '0')} ${period}`;
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Staff', href: '/admin/staff' },
                {
                    label: staff.user.name,
                    href: `/admin/staff/${staff.id}/edit`,
                },
                { label: 'Availability' },
            ]}
        >
            {flash?.success && (
                <div className="mb-4 rounded border border-emerald-800 bg-emerald-950/50 px-4 py-2 text-xs text-emerald-400">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 rounded border border-red-900 bg-red-950/40 px-4 py-2 text-xs text-red-400">
                    {flash.error}
                </div>
            )}

            <div className="max-w-2xl space-y-8">
                {/* ── Existing Slots ─────────────────────────────────────── */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold tracking-widest text-white uppercase">
                        Current Schedule — {staff.user.name}
                    </h2>

                    {availabilities.length === 0 ? (
                        <p className="rounded border border-zinc-800 px-4 py-8 text-center text-xs text-zinc-600">
                            No availability set yet. Add slots below.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded border border-zinc-800">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                                        <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                            Day
                                        </th>
                                        <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                            Start
                                        </th>
                                        <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                            End
                                        </th>
                                        <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availabilities.map((slot) => (
                                        <tr
                                            key={slot.id}
                                            className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/30"
                                        >
                                            <td className="px-4 py-3 font-medium text-white">
                                                {getDayLabel(slot.day_of_week)}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-300">
                                                {formatTime(slot.start_time)}
                                            </td>
                                            <td className="px-4 py-3 text-zinc-300">
                                                {formatTime(slot.end_time)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {slot.is_active ? (
                                                    <Badge className="border-emerald-800 bg-emerald-950 text-[10px] text-emerald-400">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="border-zinc-700 bg-zinc-900 text-[10px] text-zinc-500">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Toggle active/inactive */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className={`h-7 w-7 ${slot.is_active ? 'text-emerald-500 hover:text-zinc-400' : 'text-zinc-600 hover:text-emerald-400'} hover:bg-zinc-800`}
                                                        onClick={() =>
                                                            handleToggle(
                                                                slot.id,
                                                            )
                                                        }
                                                        title={
                                                            slot.is_active
                                                                ? 'Deactivate'
                                                                : 'Activate'
                                                        }
                                                    >
                                                        {slot.is_active ? (
                                                            <ToggleRight
                                                                size={14}
                                                            />
                                                        ) : (
                                                            <ToggleLeft
                                                                size={14}
                                                            />
                                                        )}
                                                    </Button>
                                                    {/* Delete */}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-zinc-400 hover:bg-red-950/30 hover:text-red-400"
                                                        onClick={() =>
                                                            handleDelete(
                                                                slot.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ── Add New Slots ───────────────────────────────────────── */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold tracking-widest text-white uppercase">
                        Add New Slots
                    </h2>

                    <form onSubmit={submit} className="space-y-3">
                        {data.availabilities.map((slot, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-3 rounded border border-zinc-800 px-3 py-3"
                            >
                                {/* Day selector */}
                                <div>
                                    <select
                                        value={slot.day_of_week}
                                        onChange={(e) =>
                                            updateSlot(
                                                index,
                                                'day_of_week',
                                                Number(e.target.value),
                                            )
                                        }
                                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                                    >
                                        {DAYS.map((day) => (
                                            <option
                                                key={day.value}
                                                value={day.value}
                                            >
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors[
                                        `availabilities.${index}.day_of_week` as keyof typeof errors
                                    ] && (
                                        <p className="mt-1 text-[10px] text-red-400">
                                            {
                                                errors[
                                                    `availabilities.${index}.day_of_week` as keyof typeof errors
                                                ]
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Start time */}
                                <div>
                                    <input
                                        type="time"
                                        value={slot.start_time}
                                        onChange={(e) =>
                                            updateSlot(
                                                index,
                                                'start_time',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                                    />
                                    {errors[
                                        `availabilities.${index}.start_time` as keyof typeof errors
                                    ] && (
                                        <p className="mt-1 text-[10px] text-red-400">
                                            {
                                                errors[
                                                    `availabilities.${index}.start_time` as keyof typeof errors
                                                ]
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* End time */}
                                <div>
                                    <input
                                        type="time"
                                        value={slot.end_time}
                                        onChange={(e) =>
                                            updateSlot(
                                                index,
                                                'end_time',
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                                    />
                                    {errors[
                                        `availabilities.${index}.end_time` as keyof typeof errors
                                    ] && (
                                        <p className="mt-1 text-[10px] text-red-400">
                                            {
                                                errors[
                                                    `availabilities.${index}.end_time` as keyof typeof errors
                                                ]
                                            }
                                        </p>
                                    )}
                                </div>

                                {/* Active checkbox */}
                                <label className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={slot.is_active}
                                        onChange={(e) =>
                                            updateSlot(
                                                index,
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                        className="h-3.5 w-3.5 accent-white"
                                    />
                                    <span className="text-[10px] tracking-widest text-zinc-400 uppercase">
                                        Active
                                    </span>
                                </label>

                                {/* Remove row button */}
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-zinc-600 hover:bg-red-950/30 hover:text-red-400"
                                    onClick={() => removeSlot(index)}
                                    disabled={data.availabilities.length === 1}
                                >
                                    <Trash2 size={11} />
                                </Button>
                            </div>
                        ))}

                        {/* Add row + Submit */}
                        <div className="flex items-center gap-3 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={addSlot}
                                className="gap-1.5 text-xs tracking-widest text-zinc-400 uppercase hover:text-white"
                            >
                                <Plus size={11} />
                                Add Another Day
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="gap-1.5 bg-white text-xs tracking-widest text-black uppercase hover:bg-zinc-200"
                            >
                                <Save size={11} />
                                Save Slots
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
