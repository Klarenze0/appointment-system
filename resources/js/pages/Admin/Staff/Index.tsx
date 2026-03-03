import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { StaffProfile } from '@/types';
import { Plus, Pencil, PowerOff, CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
    staff: {
        data: (StaffProfile & {
            user: { name: string; email: string };
            services_count: number;
        })[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    flash?: { success?: string };
}

export default function StaffIndex({ staff, flash }: Props) {
    function handleDeactivate(id: number, name: string) {
        if (confirm(`Deactivate "${name}"? They will no longer appear for new bookings.`)) {
            router.delete(`/admin/staff/${id}`);
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Staff' },
            ]}
        >
            {flash?.success && (
                <div className="mb-4 text-xs text-emerald-400 border border-emerald-800 bg-emerald-950/50 px-4 py-2 rounded">
                    {flash.success}
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Staff</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">{staff.total} members</p>
                </div>
                <Link href="/admin/staff/create">
                    <Button size="sm" className="bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-widest gap-1.5">
                        <Plus size={12} />
                        Add Staff
                    </Button>
                </Link>
            </div>

            <div className="border border-zinc-800 rounded overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Name</th>
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Email</th>
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Services</th>
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.data.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center text-zinc-600 py-12">
                                    No staff members yet.
                                </td>
                            </tr>
                        )}
                        {staff.data.map((member) => (
                            <tr key={member.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                <td className="px-4 py-3 text-white font-medium">{member.user.name}</td>
                                <td className="px-4 py-3 text-zinc-400">{member.user.email}</td>
                                <td className="px-4 py-3 text-zinc-400">{member.services_count} services</td>
                                <td className="px-4 py-3">
                                    {member.is_active ? (
                                        <Badge className="bg-emerald-950 text-emerald-400 border-emerald-800 gap-1 text-[10px]">
                                            <CheckCircle size={9} /> Active
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-zinc-900 text-zinc-500 border-zinc-700 gap-1 text-[10px]">
                                            <XCircle size={9} /> Inactive
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2 justify-end">
                                        <Link href={`/admin/staff/${member.id}/availability`}>
                                            <Button size="icon" variant="ghost"
                                                className="h-7 w-7 text-zinc-400 hover:text-sky-400 hover:bg-sky-950/30"
                                                title="Manage Availability">
                                                <CalendarDays size={12} />
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/staff/${member.id}/edit`}>
                                            <Button size="icon" variant="ghost"
                                                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                <Pencil size={12} />
                                            </Button>
                                        </Link>
                                        {member.is_active && (
                                            <Button size="icon" variant="ghost"
                                                className="h-7 w-7 text-zinc-400 hover:text-orange-400 hover:bg-orange-950/30"
                                                onClick={() => handleDeactivate(member.id, member.user.name)}>
                                                <PowerOff size={12} />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {staff.links.length > 3 && (
                <div className="flex gap-1 mt-4">
                    {staff.links.map((link, i) => (
                        link.url ? (
                            <Link key={i} href={link.url}
                                className={`px-3 py-1.5 text-xs border rounded transition-colors ${
                                    link.active
                                        ? 'bg-white text-black border-white'
                                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span key={i}
                                className="px-3 py-1.5 text-xs border border-zinc-800 text-zinc-700 rounded cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        )
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}