import { Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { PageProps } from '@/types';
import {
    LayoutDashboard,
    Scissors,
    Users,
    CalendarDays,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    breadcrumbs?: { label: string; href?: string }[];
}

const navItems = [
    { label: 'Dashboard',    href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Services',     href: '/admin/services',  icon: Scissors },
    { label: 'Staff',        href: '/admin/staff',     icon: Users },
    { label: 'Appointments', href: '/admin/calendar',  icon: CalendarDays },
    { label: 'Settings',     href: '/admin/settings',  icon: Settings },
];

export default function AdminLayout({ children, title, breadcrumbs }: AdminLayoutProps) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-mono">
            {/* Sidebar */}
            <aside className="w-60 border-r border-zinc-800 flex flex-col">
                {/* Brand */}
                <div className="h-14 flex items-center px-5 border-b border-zinc-800">
                    <span className="text-sm font-bold tracking-widest text-white uppercase">
                        ApptSys
                    </span>
                    <span className="ml-2 text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Admin
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = typeof window !== 'undefined' &&
                            window.location.pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-5 py-2.5 text-xs tracking-widest uppercase transition-colors',
                                    active
                                        ? 'bg-zinc-800 text-white border-l-2 border-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                )}
                            >
                                <Icon size={14} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-zinc-800 p-4">
                    <p className="text-[11px] text-zinc-500 truncate mb-3">{auth.user?.email}</p>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="flex items-center gap-2 text-xs text-zinc-400 hover:text-red-400 transition-colors uppercase tracking-widest"
                    >
                        <LogOut size={12} />
                        Sign out
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar */}
                <header className="h-14 border-b border-zinc-800 flex items-center px-6 gap-2">
                    {breadcrumbs && breadcrumbs.map((crumb, i) => (
                        <span key={i} className="flex items-center gap-2 text-xs">
                            {crumb.href ? (
                                <Link href={crumb.href} className="text-zinc-400 hover:text-white transition-colors">
                                    {crumb.label}
                                </Link>
                            ) : (
                                <span className="text-white">{crumb.label}</span>
                            )}
                            {i < breadcrumbs.length - 1 && (
                                <ChevronRight size={10} className="text-zinc-600" />
                            )}
                        </span>
                    ))}
                    {title && !breadcrumbs && (
                        <span className="text-sm font-semibold text-white">{title}</span>
                    )}
                </header>

                {/* Page content */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}