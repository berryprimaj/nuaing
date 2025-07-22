@php
    // In a real app, these settings would come from a service provider or view composer
    $settings = \App\Models\Setting::all()->pluck('value', 'key')->all();
    $bgImage = $settings['hotspot_bg_image'] ?? null;
    $logo = $settings['hotspot_logo'] ?? null;
    if ($bgImage) {
        $bgImage = \Illuminate\Support\Facades\Storage::disk('public')->url($bgImage);
    }
    if ($logo) {
        $logo = \Illuminate\Support\Facades\Storage::disk('public')->url($logo);
    }
@endphp

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You are Connected!</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body {
            background-image: url('{{ $bgImage ?? 'https://images.unsplash.com/photo-1554118811-1e2d58224f24' }}');
            background-size: cover;
            background-position: center;
        }
        .backdrop-blur-sm {
             background-color: rgba(255, 255, 255, 0.9);
             backdrop-filter: blur(4px);
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen bg-gray-200 p-4">

    <div class="w-full max-w-lg p-8 space-y-6 bg-white backdrop-blur-sm rounded-2xl shadow-2xl text-center">
        
        @if($logo)
            <img src="{{ $logo }}" alt="Logo" class="w-24 mx-auto mb-4">
        @endif

        <div class="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
             <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-800">You are Connected!</h1>
        <p class="text-gray-600">Welcome, <strong>{{ $user['fullname'] ?? 'Guest' }}</strong>. You are now online.</p>
        
        <div class="border-t border-b border-gray-200 my-6 py-4">
            <h2 class="text-lg font-semibold text-gray-700 mb-4">Session Details</h2>
            <div class="grid grid-cols-2 gap-4 text-left">
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">IP Address</p>
                    <p class="font-semibold text-gray-800">{{ $sessionData['ip_address'] ?? 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">Login Method</p>
                    <p class="font-semibold text-gray-800 capitalize">{{ $user['auth_method'] ?? 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">Session Uptime</p>
                    <p class="font-semibold text-gray-800">{{ $sessionData['uptime'] ?? 'N/A' }}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-lg">
                    <p class="text-sm text-gray-500">Data Usage</p>
                    <p class="font-semibold text-gray-800">{{ $sessionData['bytes_out_formatted'] ?? 'N/A' }} Up / {{ $sessionData['bytes_in_formatted'] ?? 'N/A' }} Down</p>
                </div>
            </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
            <a href="https://google.com" target="_blank" class="flex-1 w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Start Browsing</a>
            <form action="{{ route('hotspot.logout') }}" method="POST" class="flex-1 w-full">
                 @csrf
                 <button type="submit" class="w-full py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">Disconnect</button>
            </form>
        </div>
    </div>

</body>
</html>