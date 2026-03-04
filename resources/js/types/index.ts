export type * from './auth';
export type * from './navigation';
export type * from './ui';
import { PageProps as InertiaPageProps } from '@inertiajs/core';

export type UserRole = 'admin' | 'staff' | 'client';

export type AppointmentStatus = 
    | 'pending' 
    | 'confirmed' 
    | 'cancelled' 
    | 'completed' 
    | 'no_show';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

export interface Service {
    id: number;
    name: string;
    description: string | null;
    duration_minutes: number;
    price: string;
    is_active: boolean;
}

export interface StaffProfile {
    id: number;
    user_id: number;
    bio: string | null;
    phone: string | null;
    is_active: boolean;
    user?: AuthUser;
}

export interface Appointment {
    id: number;
    client_id: number;
    staff_id: number;
    service_id: number;
    starts_at: string;   // ISO 8601 UTC string
    ends_at: string;
    status: AppointmentStatus;
    notes: string | null;
    client?: AuthUser;
    staff?: StaffProfile;
    service?: Service;
}

export interface Payment {
    id: number;
    appointment_id: number;
    amount: string;
    currency: string;
    gateway: string;
    status: PaymentStatus;
    gateway_reference: string | null;
}

// Inertia shared data shape
export interface PageProps extends InertiaPageProps {
    auth: {
        user: AuthUser | null;
    };
    flash: {
        success?: string;
        error?: string;
    };
}

export interface StaffAvailability {
    id: number;
    staff_id: number;
    day_of_week: number;  // 0=Sunday, 6=Saturday
    start_time: string;   // "09:00:00"
    end_time: string;     // "17:00:00"
    is_active: boolean;
}

export interface CalendarAppointment {
    id: number;
    starts_at: string;
    ends_at: string;
    status: AppointmentStatus;
    client_name: string;
    staff_name: string;
    service_name: string;
    duration: number;
}