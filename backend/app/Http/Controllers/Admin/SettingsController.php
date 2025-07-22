<?php
// app/Http/Controllers/Admin/SettingsController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting; // Pastikan model Setting sudah ada
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    /**
     * Get all settings.
     */
    public function index()
    {
        // Return settings as a key-value pair object for easy use in frontend
        $settings = Setting::all()->pluck('value', 'key')->map(function ($value, $key) {
            if ($key === 'hotspot_logo' || $key === 'hotspot_bg_image') {
                return $value ? Storage::disk('public')->url($value) : null;
            }
            return $value;
        });
        return response()->json($settings);
    }

    /**
     * Update settings.
     */
    public function update(Request $request)
    {
        $settings = $request->except(['_token', '_method']);

        foreach ($settings as $key => $value) {
            // Handle file uploads
            if ($request->hasFile($key)) {
                // Delete old file if it exists
                $oldValue = Setting::get($key);
                if ($oldValue) {
                    Storage::disk('public')->delete($oldValue);
                }
                
                // Store new file and get path
                $path = $request->file($key)->store('settings', 'public');
                Setting::set($key, $path);
            } else {
                // Save regular text-based settings
                Setting::set($key, $value);
            }
        }

        // Return all settings, including the new file paths
        $allSettings = Setting::all()->pluck('value', 'key')->map(function ($value, $key) {
             if ($key === 'hotspot_logo' || $key === 'hotspot_bg_image') {
                return $value ? Storage::disk('public')->url($value) : null;
            }
            return $value;
        });


        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => $allSettings,
        ]);
    }
}