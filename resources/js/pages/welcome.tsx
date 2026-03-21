import { Head, Link, usePage } from '@inertiajs/react';

interface Service {
    id:               number;
    name:             string;
    description:      string;
    duration_minutes: number;
    price:            string;
    is_active:        boolean;
}

interface Props {
    canRegister?: boolean;
    services?: Service[];
}

export default function Welcome({ canRegister = true, services = [] }: Props) {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Welcome" />

            <div className="min-h-screen bg-[#FDFDFC] p-6 text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-white">

                {/* Nav */}
                <header className="mb-8 flex items-center justify-between border-b pb-4">
                    <span className="font-bold text-lg">Appointment System</span>
                    <nav className="flex items-center gap-4">
                        {auth.user ? (
                            <Link href="/dashboard"
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login"
                                    className="inline-block px-5 py-1.5 text-sm hover:underline">
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link href="/register"
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm dark:border-[#3E3E3A] dark:text-[#EDEDEC]">
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                {/* Hero */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-2">Our Services</h1>
                    <p className="text-zinc-500">Login or register to book an appointment.</p>
                </div>

                {/* Services — display lang, walang booking */}
                <div className="max-w-lg space-y-3 mx-auto">
                    {services.length === 0 ? (
                        <p className="text-center text-zinc-400">No services available.</p>
                    ) : (
                        services.map(service => (
                            <div key={service.id}
                                className="text-left px-4 py-3 rounded-lg border border-zinc-200 bg-white text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                                <span className="font-medium">{service.name}</span>
                                <span className="ml-3 text-xs opacity-60">
                                    {service.duration_minutes}min · ₱{Number(service.price).toFixed(2)}
                                </span>
                                {service.description && (
                                    <p className="text-xs text-zinc-400 mt-1">{service.description}</p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* CTA — para ma-encourage mag-login */}
                {!auth.user && (
                    <div className="text-center mt-10">
                        <p className="text-zinc-500 text-sm mb-3">Ready to book?</p>
                        <Link href="/login"
                            className="inline-block bg-zinc-900 text-white px-6 py-2 rounded-sm text-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900">
                            Login to Book
                        </Link>
                    </div>
                )}

            </div>
        </>
    );
}