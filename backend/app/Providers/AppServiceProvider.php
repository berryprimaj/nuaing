<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Setting;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Auth;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share settings to all views
        View::composer('*', function ($view) {
            $settings = Setting::all()->keyBy('key')->map(fn($item) => $item->value);

            $hotspotSettings = [
                'siteName' => $settings->get('hotspot_site_name', 'MyHotspot-WiFi'),
                'primaryColor' => $settings->get('hotspot_primary_color', '#3B82F6'),
                'secondaryColor' => $settings->get('hotspot_secondary_color', '#8B5CF6'),
                'logo' => $settings->get('hotspot_logo'),
                'backgroundImage' => $settings->get('hotspot_background_image'),
                'welcomeMessage' => $settings->get('hotspot_welcome_message', 'Welcome to MyHotspot Free WiFi'),
            ];

            $adminSettings = [
                'siteName' => $settings->get('admin_site_name', 'MYHOTSPOT'),
                'primaryColor' => $settings->get('admin_primary_color', '#1E3A8A'),
                'secondaryColor' => $settings->get('admin_secondary_color', '#475569'),
                'logo' => $settings->get('admin_logo'),
                'backgroundImage' => $settings->get('admin_background_image'),
                'welcomeMessage' => $settings->get('admin_welcome_message', 'Administrator Panel'),
            ];

            $apiKeys = [
                'fonteApiKey' => $settings->get('fonte_api_key', ''),
                'fonteDeviceId' => $settings->get('fonte_device_id', ''),
                'googleClientId' => $settings->get('google_client_id', ''),
                'googleClientSecret' => $settings->get('google_client_secret', ''),
                'googleRedirectUri' => $settings->get('google_redirect_uri', 'http://localhost:8000/auth/google/callback'),
            ];

            $view->with('hotspotSettings', $hotspotSettings);
            $view->with('adminSettings', $adminSettings);
            $view->with('apiKeys', $apiKeys);
            $view->with('authUser', Auth::guard('admin')->user()); // Pass authenticated admin user
        });
    }
}