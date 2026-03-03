<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin  = 'admin';
    case Staff  = 'staff';
    case Client = 'client';

    public function label(): string
    {
        return match($this) {
            UserRole::Admin  => 'Administrator',
            UserRole::Staff  => 'Staff Member',
            UserRole::Client => 'Client',
        };
    }

    public function isAdmin(): bool
    {
        return $this === UserRole::Admin;
    }

    public function isStaff(): bool
    {
        return $this === UserRole::Staff;
    }

    public function isClient(): bool
    {
        return $this === UserRole::Client;
    }
}