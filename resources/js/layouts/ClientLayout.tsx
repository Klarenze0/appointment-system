import { Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';
import { PageProps } from '@/types';
import { CalendarDays, Plus, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientLayoutProps {
    children: ReactNode;
    title?: string;
}

const navItems = [
    { label: 'My Appointments', href: '/appointments',      icon: CalendarDays },
    { label: 'Book Appointment', href: '/appointments/book', icon: Plus },
];

export default function ClientLayout({ children, title }: ClientLayoutProps) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Top nav */}
            <header className="bg-white border-b border-zinc-200">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
                    <span className="text-sm font-bold tracking-tight text-zinc-900">
                        ApptSys
                    </span>

                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = typeof window !== 'undefined' &&
                                window.location.pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors',
                                        active
                                            ? 'bg-zinc-900 text-white'
                                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                                    )}
                                >
                                    <Icon size={12} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                            <User size={11} />
                            {auth.user?.name}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="text-xs text-zinc-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                        >
                            <LogOut size={11} />
                            Sign out
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                {title && (
                    <h1 className="text-xl font-bold text-zinc-900 mb-6">{title}</h1>
                )}
                {children}
            </main>
        </div>
    );
}