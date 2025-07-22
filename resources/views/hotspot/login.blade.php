<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $settings['hotspot_site_name'] ?? 'Welcome' }}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        body {
            background-image: url('{{ $settings['hotspot_bg_image'] ?? 'https://images.unsplash.com/photo-1554118811-1e2d58224f24' }}');
            background-size: cover;
            background-position: center;
        }
        .backdrop-blur-sm {
             background-color: rgba(255, 255, 255, 0.8);
             backdrop-filter: blur(4px);
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen bg-gray-200">

    <div class="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl text-center" x-data="hotspotLogin()">
        
        @if(isset($settings['hotspot_logo']))
            <img src="{{ $settings['hotspot_logo'] }}" alt="Logo" class="w-24 mx-auto mb-4">
        @endif

        <h1 class="text-3xl font-bold text-gray-800" x-text="currentTitle()"></h1>
        
        <p class="text-gray-600" x-text="currentSubtitle()"></p>
        
        {{-- Tabs & Forms --}}
        <div x-show="view === 'login'">
            {{-- Tab Buttons --}}
            <div class="flex justify-center border-b border-gray-300">
                <button @click="tab = 'whatsapp'" :class="{ 'border-b-2 border-blue-500 text-blue-600': tab === 'whatsapp' }" class="px-4 py-2 text-gray-600 focus:outline-none">WhatsApp</button>
                <button @click="tab = 'google'" :class="{ 'border-b-2 border-blue-500 text-blue-600': tab === 'google' }" class="px-4 py-2 text-gray-600 focus:outline-none">Google</button>
                <button @click="tab = 'member'" :class="{ 'border-b-2 border-blue-500 text-blue-600': tab === 'member' }" class="px-4 py-2 text-gray-600 focus:outline-none">Member</button>
            </div>
            
            {{-- WhatsApp Form --}}
            <div x-show="tab === 'whatsapp'" class="mt-4">
                <form @submit.prevent="sendOtp" class="space-y-4">
                    @csrf
                    <input x-model="phone" type="text" name="phone" placeholder="WhatsApp Number (e.g. 628xxxxxxxx)" class="w-full px-4 py-2 border rounded-lg" required>
                    <button type="submit" :disabled="loading" class="w-full py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-green-300">
                        <span x-text="loading ? 'Sending...' : 'Send OTP'"></span>
                    </button>
                </form>
            </div>
            
            {{-- Google Login --}}
            <div x-show="tab === 'google'" class="mt-4">
                 <a href="{{ route('google.redirect') }}" class="flex items-center justify-center w-full py-2 text-white bg-red-500 rounded-lg hover:bg-red-600">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    <span>Sign in with Google</span>
                </a>
            </div>
            
            {{-- Member Login --}}
            <div x-show="tab === 'member'" class="mt-4">
                <form action="{{ route('member.login') }}" method="POST" class="space-y-4">
                    @csrf
                    <input type="text" name="username" placeholder="Username" class="w-full px-4 py-2 border rounded-lg" required>
                    <input type="password" name="password" placeholder="Password" class="w-full px-4 py-2 border rounded-lg" required>
                    <button type="submit" class="w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">Login as Member</button>
                </form>
            </div>
        </div>

        {{-- OTP Verification Form --}}
        <div x-show="view === 'otp'" class="mt-4">
            <form @submit.prevent="verifyOtp" class="space-y-4">
                @csrf
                <input x-model="otp" type="text" name="otp" placeholder="Enter OTP Code" class="w-full px-4 py-2 border rounded-lg tracking-widest text-center" maxlength="6" required>
                <button type="submit" :disabled="loading" class="w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300">
                    <span x-text="loading ? 'Verifying...' : 'Verify & Connect'"></span>
                </button>
                <button @click="view = 'login'" type="button" class="text-sm text-gray-600 hover:underline">Back to login</button>
            </form>
        </div>
        
        <div x-show="message" x-text="message" :class="{ 'text-red-500': error, 'text-green-500': !error }" class="mt-2 text-sm"></div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script>
        function hotspotLogin() {
            return {
                view: 'login', // 'login' or 'otp'
                tab: 'whatsapp',
                phone: '',
                otp: '',
                loading: false,
                message: '',
                error: false,
                welcomeMessage: "{{ $settings['hotspot_welcome_message'] ?? 'Welcome to Our WiFi' }}",
                
                currentTitle() {
                    return this.view === 'otp' ? 'Enter Verification Code' : this.welcomeMessage;
                },

                currentSubtitle() {
                    return this.view === 'otp' ? `We've sent a code to ${this.phone}` : 'Connect with one of the options below.';
                },

                async sendOtp() {
                    this.loading = true;
                    this.message = '';
                    this.error = false;
                    
                    try {
                        const response = await fetch("{{ route('whatsapp.send_otp') }}", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}' },
                            body: JSON.stringify({ phone: this.phone })
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message || 'Failed to send OTP.');
                        
                        this.message = data.message;
                        this.view = 'otp';
                    } catch (e) {
                        this.error = true;
                        this.message = e.message;
                    } finally {
                        this.loading = false;
                    }
                },

                async verifyOtp() {
                    this.loading = true;
                    this.message = '';
                    this.error = false;

                    try {
                        const response = await fetch("{{ route('whatsapp.verify_otp') }}", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token() }}' },
                            body: JSON.stringify({ phone: this.phone, otp: this.otp })
                        });
                        const data = await response.json();
                         if (!response.ok) throw new Error(data.message || 'Verification failed.');

                        // On success, redirect to connected page
                        window.location.href = "{{ route('hotspot.connected') }}";
                    } catch (e) {
                        this.error = true;
                        this.message = e.message;
                    } finally {
                        this.loading = false;
                    }
                }
            }
        }
    </script>
</body>
</html>