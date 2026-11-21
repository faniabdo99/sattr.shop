<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = config('sattr.admin.email');
        $password = config('sattr.admin.password');

        if (User::query()->where('email', $email)->exists()) {
            return;
        }

        $generated = $password === null;
        $password ??= Str::password(20, symbols: false);

        $user = new User(['name' => config('sattr.admin.name'), 'email' => $email, 'password' => $password]);
        $user->forceFill(['is_admin' => true, 'email_verified_at' => now()])->save();

        if ($generated && $this->command) {
            $this->command->warn("ADMIN_PASSWORD is not set. Generated admin login: {$email} / {$password}");
        }
    }
}
