import AdminLayout from '@/layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Service, StaffProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    service: (Service & { staff: StaffProfile[] }) | null;
    allStaff: (StaffProfile & { user: { name: string } })[];
}

export default function ServiceForm({ service, allStaff }: Props) {
    const isEdit = service !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name:             service?.name             ?? '',
        description:      service?.description      ?? '',
        duration_minutes: service?.duration_minutes ?? 30,
        price:            service?.price            ?? '0.00',
        is_active:        service?.is_active        ?? true,
        staff_ids:        service?.staff?.map(s => s.id) ?? [] as number[],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/services/${service.id}`);
        } else {
            post('/admin/services');
        }
    }

    function toggleStaff(id: number) {
        setData('staff_ids',
            data.staff_ids.includes(id)
                ? data.staff_ids.filter(s => s !== id)
                : [...data.staff_ids, id]
        );
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin',    href: '/admin/dashboard' },
                { label: 'Services', href: '/admin/services' },
                { label: isEdit ? 'Edit' : 'New Service' },
            ]}
        >
            <div className="max-w-xl">
                <h1 className="text-lg font-bold text-white mb-6">
                    {isEdit ? `Edit: ${service.name}` : 'New Service'}
                </h1>

                <form onSubmit={submit} className="space-y-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400 uppercase tracking-widest">Name</Label>
                        <Input
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-white focus:border-white text-sm"
                            placeholder="e.g. Haircut & Style"
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400 uppercase tracking-widest">Description</Label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"
                            placeholder="Optional description..."
                        />
                        {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
                    </div>

                    {/* Duration + Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Duration (mins)</Label>
                            <Input
                                type="number"
                                min={5}
                                max={480}
                                value={data.duration_minutes}
                                onChange={e => setData('duration_minutes', Number(e.target.value))}
                                className="bg-zinc-900 border-zinc-700 text-white focus:border-white text-sm"
                            />
                            {errors.duration_minutes && <p className="text-xs text-red-400">{errors.duration_minutes}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Price ($)</Label>
                            <Input
                                type="number"
                                min={0}
                                step="0.01"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-white focus:border-white text-sm"
                            />
                            {errors.price && <p className="text-xs text-red-400">{errors.price}</p>}
                        </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="accent-white w-4 h-4"
                        />
                        <Label htmlFor="is_active" className="text-xs text-zinc-300 uppercase tracking-widest cursor-pointer">
                            Active (visible for booking)
                        </Label>
                    </div>

                    {/* Staff assignment */}
                    {allStaff.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Assigned Staff</Label>
                            <div className="border border-zinc-800 rounded divide-y divide-zinc-800">
                                {allStaff.map(staff => (
                                    <label
                                        key={staff.id}
                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-zinc-900 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.staff_ids.includes(staff.id)}
                                            onChange={() => toggleStaff(staff.id)}
                                            className="accent-white w-3.5 h-3.5"
                                        />
                                        <span className="text-sm text-zinc-300">{staff.user.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.staff_ids && <p className="text-xs text-red-400">{errors.staff_ids}</p>}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-widest gap-1.5"
                        >
                            <Save size={12} />
                            {isEdit ? 'Update Service' : 'Create Service'}
                        </Button>
                        <Link href="/admin/services">
                            <Button type="button" variant="ghost"
                                className="text-zinc-400 hover:text-white text-xs uppercase tracking-widest gap-1.5">
                                <X size={12} />
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}