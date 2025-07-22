<?php
// app/Http/Controllers/HotspotController.php

namespace App\Http\Controllers;

use App\Models\SocialUser;
use App\Services\MikrotikService;
use App\Services\FonteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use App\Models\Member; // Import Member model
use App\Models\Setting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Log; // Added Log facade

class HotspotController extends Controller
{
    private $mikrotik;
    private $fonte;

    public function __construct(MikrotikService $mikrotik, FonteService $fonte)
    {
        $this->mikrotik = $mikrotik;
        $this->fonte = $fonte;
    }

    public function showHotspotLogin()
    {
        $settings = Setting::all()->pluck('value', 'key')->map(function ($value, $key) {
            if ($key === 'hotspot_logo' || $key === 'hotspot_bg_image') {
                return $value ? Storage::disk('public')->url($value) : null;
            }
            return $value;
        });
        return view('hotspot.login', compact('settings'));
    }

    public function sendWhatsAppOTP(Request $request)
    {
        $request->validate([
            'phone' => [
                'required',
                'regex:/^(\+62|62|0)8[1-9][0-9]{6,10}$/', // Nomor Indonesia
                'string',
                'min:10',
                'max:15'
            ]
        ], [
            'phone.regex' => 'Nomor WhatsApp harus format Indonesia yang valid (08xxx atau 62xxx).'
        ]);

        $phone = $request->phone;
        $otp = rand(100000, 999999);

        // Store OTP in session
        session(['whatsapp_otp' => $otp, 'whatsapp_phone' => $phone]);

        // Send OTP via Fonte
        // $result = $this->fonte->sendMessage($phone, "Your WiFi access code: $otp"); // Uncomment in production
        $result = true; // Simulate success for now

        if ($result) {
            Log::info('OTP WhatsApp dikirim ke: ' . $phone);
            return response()->json(['success' => true, 'message' => 'OTP sent successfully']);
        }

        Log::warning('Gagal mengirim OTP WhatsApp ke: ' . $phone);
        return response()->json(['success' => false, 'message' => 'Failed to send OTP']);
    }

    public function verifyWhatsAppOTP(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp' => 'required|string'
        ]);

        if (session('whatsapp_otp') == $request->otp && session('whatsapp_phone') == $request->phone) {
            // Create hotspot user
            $username = 'wa_' . substr($request->phone, -8);
            $password = Hash::make($request->phone);
            
            // Add to MikroTik
            // $this->mikrotik->addHotspotUser($username, $password, 'Free-1Hour'); // Uncomment in production
            
            // Store in database
            SocialUser::create([
                'name' => 'WhatsApp User',
                'phone' => $request->phone,
                'provider' => 'whatsapp',
                'ip_address' => $request->ip(),
                'connected_at' => now(),
                'is_active' => true
            ]);
            
            // Clear OTP
            session()->forget(['whatsapp_otp', 'whatsapp_phone']);
            
            return response()->json(['success' => true, 'redirect' => route('hotspot.connected')]);
        }
        
        return response()->json(['success' => false, 'message' => 'Invalid OTP']);
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $user = Socialite::driver('google')->user();
            
            // Create hotspot user
            $username = 'google_' . $user->id;
            $password = Hash::make($user->email);
            
            // Add to MikroTik
            // $this->mikrotik->addHotspotUser($username, $password, 'Free-1Hour'); // Uncomment in production
            
            // Store in database
            SocialUser::create([
                'name' => $user->name,
                'email' => $user->email,
                'provider' => 'google',
                'provider_id' => $user->id,
                'ip_address' => request()->ip(),
                'connected_at' => now(),
                'is_active' => true
            ]);
            
            return redirect()->route('hotspot.connected');
        } catch (\Exception $e) {
            Log::error('Google login failed: ' . $e->getMessage());
            return redirect()->route('hotspot.login')->with('error', 'Google login failed');
        }
    }

    public function memberLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string'
        ]);

        $member = Member::where('username', $request->username)->first();
        
        // Simulate password check as we don't have Hash::check for plain text in React
        // In a real Laravel app, you'd use Hash::check($request->password, $member->password)
        if ($member && $request->password === $member->password) { // Simplified for direct comparison with React's local storage
            // Add to MikroTik
            // $this->mikrotik->addHotspotUser($member->username, $member->password, 'Premium-1Day'); // Uncomment in production
            
            // Update last login
            $member->update(['last_login_at' => now()]);
            
            return response()->json(['success' => true, 'redirect' => route('hotspot.connected')]);
        }
        
        return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
    }

    public function showConnectedPage()
    {
        if (!session()->has('hotspot_user')) {
            return redirect()->route('hotspot.login');
        }

        $user = session('hotspot_user');
        $sessionData = [];
        
        try {
            $mikrotikService = new MikrotikService();
            $ip = request()->ip();
            $activeUser = $mikrotikService->getActiveHotspotUserByIp($ip);

            if ($activeUser) {
                $sessionData = [
                    'uptime' => $activeUser['uptime'],
                    'bytes_in_formatted' => $this->formatBytes($activeUser['bytes-in']),
                    'bytes_out_formatted' => $this->formatBytes($activeUser['bytes-out']),
                    'ip_address' => $activeUser['address'],
                ];
                // Store the MikroTik user ID in session for logout
                session(['mikrotik_active_id' => $activeUser['.id']]);
            }

        } catch (\Exception $e) {
            Log::error("Could not fetch session data from MikroTik: " . $e->getMessage());
            // It's okay to fail, we'll just show N/A
        }
        
        return view('hotspot.connected', compact('user', 'sessionData'));
    }

    public function logout(Request $request)
    {
        $mikrotikId = session('mikrotik_active_id');

        if ($mikrotikId) {
            try {
                $mikrotikService = new MikrotikService();
                $mikrotikService->removeActiveHotspotUser($mikrotikId);
            } catch (\Exception $e) {
                Log::error("Could not disconnect user from MikroTik: " . $e->getMessage());
                // Don't block logout even if MikroTik fails
            }
        }

        $request->session()->forget(['hotspot_user', 'mikrotik_active_id']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('hotspot.login')->with('message', 'You have been disconnected.');
    }

    private function formatBytes($bytes, $precision = 2) { 
        $units = array('B', 'KB', 'MB', 'GB', 'TB'); 
    
        $bytes = max($bytes, 0); 
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
        $pow = min($pow, count($units) - 1); 
    
        $bytes /= (1 << (10 * $pow)); 
    
        return round($bytes, $precision) . ' ' . $units[$pow]; 
    }
}