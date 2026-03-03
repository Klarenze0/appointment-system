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
export interface PageProps {
    auth: {
        user: AuthUser | null;
    };
}