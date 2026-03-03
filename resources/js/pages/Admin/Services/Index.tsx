import AdminLayout from '@/layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { Service } from '@/types';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Props {
    services: {
        data: (Service & { staff_count: number })[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
    flash?: { success?: string };
}

export default function ServicesIndex({ services, flash }: Props) {
    function handleDelete(id: number, name: string) {
        if (confirm(`Remove service "${name}"? Existing appointments are preserved.`)) {
            router.delete(`/admin/services/${id}`);
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Admin', href: '/admin/dashboard' },
                { label: 'Services' },
            ]}
        >
            {/* Flash */}
            {flash?.success && (
                <div className="mb-4 text-xs text-emerald-400 border border-emerald-800 bg-emerald-950/50 px-4 py-2 rounded">
                    {flash.success}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Services</h1>
                    <p className="text-xs text-zinc-500 mt-0.5">{services.total} total</p>
                </div>
                <Link href="/admin/services/create">
                    <Button size="sm" className="bg-white text-black hover:bg-zinc-200 text-xs uppercase tracking-widest gap-1.5">
                        <Plus size={12} />
                        New Service
                    </Button>
                </Link>
            </div>

            {/* Table */}
            <div className="border border-zinc-800 rounded overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-zinc-800 bg-zinc-900/50">
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Service</th>
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Duration</th>
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Price</th>
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Staff</th>
                            <th className="text-left px-4 py-3 text-zinc-500 uppercase tracking-widest font-normal">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center text-zinc-600 py-12">
                                    No services yet. Create your first one.
                                </td>
                            </tr>
                        )}
                        {services.data.map((service) => (
                            <tr key={service.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="text-white font-medium">{service.name}</p>
                                    {service.description && (
                                        <p className="text-zinc-500 mt-0.5 truncate max-w-xs">{service.description}</p>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-zinc-300">
                                    {service.duration_minutes} min
                                </td>
                                <td className="px-4 py-3 text-zinc-300">
                                    ${Number(service.price).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-zinc-400">
                                    {service.staff_count} assigned
                                </td>
                                <td className="px-4 py-3">
                                    {service.is_active ? (
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
                                        <Link href={`/admin/services/${service.id}/edit`}>
                                            <Button size="icon" variant="ghost"
                                                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                                <Pencil size={12} />
                                            </Button>
                                        </Link>
                                        <Button size="icon" variant="ghost"
                                            className="h-7 w-7 text-zinc-400 hover:text-red-400 hover:bg-red-950/30"
                                            onClick={() => handleDelete(service.id, service.name)}>
                                            <Trash2 size={12} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {services.links.length > 3 && (
                <div className="flex gap-1 mt-4">
                    {services.links.map((link, i) => (
                        link.url ? (
                            <Link
                                key={i}
                                href={link.url}
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