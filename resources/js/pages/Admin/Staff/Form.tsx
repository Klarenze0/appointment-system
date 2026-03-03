import AdminLayout from '@/layouts/AdminLayout';
import { useForm } from '@inertiajs/react';
import { Service, StaffProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    staffMember: (StaffProfile & {
        user: { name: string; email: string };
        services: Service[];
    }) | null;
    allServices: Service[];
}

export default function StaffForm({ staffMember, allServices }: Props) {
    const isEdit = staffMember !== null;

    const { data, setData, post, put, processing, errors } = useForm({
        name:        staffMember?.user?.name  ?? '',
        email:       staffMember?.user?.email ?? '',
        password:    '',
        bio:         staffMember?.bio         ?? '',
        phone:       staffMember?.phone       ?? '',
        is_active:   staffMember?.is_active   ?? true,
        service_ids: staffMember?.services?.map(s => s.id) ?? [] as number[],
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/staff/${staffMember.id}`);
        } else {
            post('/admin/staff');
        }
    }

    function toggleService(id: number) {
        setData('service_ids',
            data.service_ids.includes(id)
                ? data.service_ids.filter(s => s !== id)
                : [...data.service_ids, id]
        );
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Staff', href: '/admin/staff' },
                { label: isEdit ? 'Edit' : 'New Staff Member' },
            ]}
        >
            <div className="max-w-xl">
                <h1 className="text-lg font-bold text-white mb-6">
                    {isEdit ? `Edit: ${staffMember.user.name}` : 'New Staff Member'}
                </h1>

                <form onSubmit={submit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Full Name</Label>
                            <Input value={data.name} onChange={e => setData('name', e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-white focus:border-white text-sm"
                                placeholder="Jane Smith" />
                            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Email</Label>
                            <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-white focus:border-white text-sm"
                                placeholder="jane@example.com" />
                            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                        </div>
                    </div>

                    {!isEdit && (
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Password</Label>
                            <Input type="password" value={data.password} onChange={e => setData('password', e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-white focus:border-white text-sm"
                                placeholder="Min. 8 chars, mixed case + number" />
                            {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Phone</Label>
                            <Input value={data.phone} onChange={e => setData('phone', e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-white focus:border-white text-sm"
                                placeholder="+1 555 000 0000" />
                            {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end pb-0.5">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input type="checkbox" checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                    className="accent-white w-4 h-4" />
                                <span className="text-xs text-zinc-300 uppercase tracking-widest">Active</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs text-zinc-400 uppercase tracking-widest">Bio</Label>
                        <textarea value={data.bio} onChange={e => setData('bio', e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white resize-none"
                            placeholder="Brief bio..." />
                    </div>

                    {allServices.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs text-zinc-400 uppercase tracking-widest">Assigned Services</Label>
                            <div className="border border-zinc-800 rounded divide-y divide-zinc-800">
                                {allServices.map(service => (
                                    <label key={service.id}
                                        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-zinc-900 transition-colors">
                                        <input type="checkbox"
                                            checked={data.service_ids.includes(service.id)}
                                            onChange={() => toggleService(service.id)}
                                            className="accent-white w-3.5 h-3.5" />
                                        <span className="text-sm text-zinc-300">{service.name}</span>
                                        <span className="ml-auto text-zinc-600">{service.duration_minutes}min</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={processing}
                            className="bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-widest gap-1.5">
                            <Save size={12} />
                            {isEdit ? 'Update Staff' : 'Create Staff Member'}
                        </Button>
                        <Link href="/admin/staff">
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