import { PropsWithChildren } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, Calendar, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageProps } from '@/types';

interface Props extends PropsWithChildren {
    title?: string;
}

export default function StaffLayout({ children, title }: Props) {
    const { auth } = usePage<PageProps>().props;

    const navItems = [
        { href: '/staff/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
        { href: '/staff/appointments', label: 'Appointments', icon: Calendar },
    ];

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col shrink-0">
                <div className="px-5 py-5 border-b border-zinc-100">
                    <span className="text-sm font-bold text-zinc-900 tracking-tight font-mono">
                        STAFF PORTAL
                    </span>
                </div>

                <nav className="flex-1 p-3 space-y-0.5">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = window.location.pathname.startsWith(href);
                        return (
                            <Link key={href} href={href}>
                                <button className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                                    isActive
                                        ? 'bg-zinc-900 text-white'
                                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                                }`}>
                                    <Icon size={14} />
                                    {label}
                                </button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-zinc-100">
                    <div className="flex items-center gap-2 px-3 py-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                            <User size={12} className="text-zinc-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-zinc-900 truncate">
                                {auth.user.name}
                            </p>
                            <p className="text-[10px] text-zinc-500 truncate">
                                {auth.user.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 text-xs h-8"
                        onClick={() => router.post('/logout')}
                    >
                        <LogOut size={12} />
                        Logout
                    </Button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-zinc-200 px-6 py-4 shrink-0">
                    <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}