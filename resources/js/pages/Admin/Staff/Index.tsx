import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { StaffProfile } from '@/types';
import {
    Plus,
    Pencil,
    PowerOff,
    CheckCircle,
    XCircle,
    CalendarDays,
    Trash2,
} from 'lucide-react';
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
    function handleDelete(id: number, name: string) {
        if (
            confirm(
                `Permanently delete "${name}"?\n\nThis cannot be undone. Staff must have no pending or confirmed appointments.`,
            )
        ) {
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
                <div className="mb-4 rounded border border-emerald-800 bg-emerald-950/50 px-4 py-2 text-xs text-emerald-400">
                    {flash.success}
                </div>
            )}

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        Staff
                    </h1>
                    <p className="mt-0.5 text-xs text-zinc-500">
                        {staff.total} members
                    </p>
                </div>
                <Link href="/admin/staff/create">
                    <Button
                        size="sm"
                        className="gap-1.5 bg-white text-xs tracking-widest text-black uppercase hover:bg-zinc-200"
                    >
                        <Plus size={12} />
                        Add Staff
                    </Button>
                </Link>
            </div>

            <div className="overflow-hidden rounded border border-zinc-800">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                            <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                Name
                            </th>
                            <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                Services
                            </th>
                            <th className="px-4 py-3 text-left font-normal tracking-widest text-zinc-500 uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {staff.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-12 text-center text-zinc-600"
                                >
                                    No staff members yet.
                                </td>
                            </tr>
                        )}
                        {staff.data.map((member) => (
                            <tr
                                key={member.id}
                                className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-900/30"
                            >
                                <td className="px-4 py-3 font-medium text-white">
                                    {member.user.name}
                                </td>
                                <td className="px-4 py-3 text-zinc-400">
                                    {member.user.email}
                                </td>
                                <td className="px-4 py-3 text-zinc-400">
                                    {member.services_count} services
                                </td>
                                <td className="px-4 py-3">
                                    {member.is_active ? (
                                        <Badge className="gap-1 border-emerald-800 bg-emerald-950 text-[10px] text-emerald-400">
                                            <CheckCircle size={9} /> Active
                                        </Badge>
                                    ) : (
                                        <Badge className="gap-1 border-zinc-700 bg-zinc-900 text-[10px] text-zinc-500">
                                            <XCircle size={9} /> Inactive
                                        </Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/staff/${member.id}/availability`}
                                        >
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-zinc-400 hover:bg-sky-950/30 hover:text-sky-400"
                                                title="Manage Availability"
                                            >
                                                <CalendarDays size={12} />
                                            </Button>
                                        </Link>
                                        <Link
                                            href={`/admin/staff/${member.id}/edit`}
                                        >
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                            >
                                                <Pencil size={12} />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-zinc-400 hover:bg-red-950/30 hover:text-red-400"
                                            title="Delete Staff"
                                            onClick={() =>
                                                handleDelete(
                                                    member.id,
                                                    member.user.name,
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

            {staff.links.length > 3 && (
                <div className="mt-4 flex gap-1">
                    {staff.links.map((link, i) =>
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
                                className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                                    link.active
                                        ? 'border-white bg-white text-black'
                                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ) : (
                            <span
                                key={i}
                                className="cursor-not-allowed rounded border border-zinc-800 px-3 py-1.5 text-xs text-zinc-700"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ),
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
