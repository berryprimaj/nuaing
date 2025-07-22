<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default super_admin if not exists
        if (!Admin::where('username', 'admin')->exists()) {
            $admin = Admin::create([
                'username' => 'admin',
                'email' => 'admin@example.com',
                'password' => Hash::make('admin'), // Hash the password
                'is_active' => true,
                'last_login_at' => now(),
                'role' => 'super_admin', // Custom role field
            ]);
            // Assign role using Spatie/laravel-permission
            $admin->assignRole('super_admin');
        }

        // Create default settings if not exists
        if (!\App\Models\Setting::where('key', 'hotspot_site_name')->exists()) {
            \App\Models\Setting::create(['key' => 'hotspot_site_name', 'value' => 'MyHotspot-WiFi', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'hotspot_primary_color', 'value' => '#3B82F6', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'hotspot_secondary_color', 'value' => '#8B5CF6', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'hotspot_welcome_message', 'value' => 'Welcome to MyHotspot Free WiFi', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'hotspot_logo', 'value' => null, 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'hotspot_background_image', 'value' => null, 'type' => 'string']);

            \App\Models\Setting::create(['key' => 'admin_site_name', 'value' => 'MYHOTSPOT', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'admin_primary_color', 'value' => '#1E3A8A', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'admin_secondary_color', 'value' => '#475569', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'admin_welcome_message', 'value' => 'Administrator Panel', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'admin_logo', 'value' => null, 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'admin_background_image', 'value' => null, 'type' => 'string']);

            \App\Models\Setting::create(['key' => 'fonte_api_key', 'value' => '', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'fonte_device_id', 'value' => '', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'google_client_id', 'value' => '', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'google_client_secret', 'value' => '', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'google_redirect_uri', 'value' => 'http://localhost:8000/auth/google/callback', 'type' => 'string']);

            \App\Models\Setting::create(['key' => 'mikrotik_online_host', 'value' => '', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'mikrotik_online_port', 'value' => '8728', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'mikrotik_online_username', 'value' => 'admin', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'mikrotik_online_password', 'value' => '', 'type' => 'string']);

            \App\Models\Setting::create(['key' => 'mikrotik_offline_host', 'value' => '192.168.1.1', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'mikrotik_offline_port', 'value' => '8728', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'mikrotik_offline_username', 'value' => 'admin', 'type' => 'string']);
            \App\Models\Setting::create(['key' => 'mikrotik_offline_password', 'value' => '', 'type' => 'string']);
        }
    }
}
