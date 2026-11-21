<?php

namespace App\Policies;

use App\Models\User;

/**
 * Sattr has one staff role. Every admin-managed model shares this policy:
 * admins may do everything, nobody else may do anything.
 */
class AdminOnlyPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_admin;
    }

    public function view(User $user): bool
    {
        return $user->is_admin;
    }

    public function create(User $user): bool
    {
        return $user->is_admin;
    }

    public function update(User $user): bool
    {
        return $user->is_admin;
    }

    public function delete(User $user): bool
    {
        return $user->is_admin;
    }
}
