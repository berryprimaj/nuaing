<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $hotspotSettings['siteName'] ?? 'MikroTik Hotspot' }}</title>
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="font-sans antialiased">
    @php
        $primaryColor = $hotspotSettings['primaryColor'] ?? '#3B82F6';
        $secondaryColor = $hotspotSettings['secondaryColor'] ?? '#8B5CF6';
        $backgroundImage = $hotspotSettings['backgroundImage'] ?? null;
    @endphp

    <div class="min-h-screen flex items-center justify-center p-4"
         style="background-size: cover; background-position: center center; background-attachment: fixed;
                background-image: {{ $backgroundImage ? 'url(' . $backgroundImage . ')' : 'linear-gradient(to bottom right, ' . $primaryColor . ', ' . $secondaryColor . ')' }}">
        <div class="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
            <div class="text-center mb-8">
                <div class="mb-6">
                    @if($hotspotSettings['logo'])
                        <img src="{{ $hotspotSettings['logo'] }}" alt="Logo" class="h-32 w-auto mx-auto" />
                    @else
                        <div class="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                            <i data-lucide="wifi" class="w-8 h-8 text-white"></i>
                        </div>
                    @endif
                </div>
                <h1 class="text-2xl font-bold text-gray-800">{{ $hotspotSettings['siteName'] ?? 'MyHotspot-WiFi' }}</h1>
                <p class="text-gray-600 mt-2">{{ $hotspotSettings['welcomeMessage'] ?? 'Welcome to MyHotspot Free WiFi' }}</p>
            </div>

            {{-- WhatsApp Login --}}
            <div class="mb-6">
                <label for="whatsapp-phone" class="block text-sm font-medium text-gray-700 mb-2">
                    <i data-lucide="message-circle" class="inline w-4 h-4 mr-2 text-green-600"></i>
                    WhatsApp Number
                </label>
                <input
                    type="tel"
                    id="whatsapp-phone"
                    placeholder="+62 812 3456 7890"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button
                    id="send-otp-button"
                    class="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                    <i data-lucide="message-circle" class="w-5 h-5 mr-2"></i>
                    <span>Send OTP via WhatsApp</span>
                </button>
            </div>

            <div class="flex items-center mb-6">
                <div class="flex-1 border-t border-gray-300"></div>
                <span class="px-4 text-gray-500 text-sm">Or continue with</span>
                <div class="flex-1 border-t border-gray-300"></div>
            </div>

            {{-- Google Login --}}
            <a
                href="{{ route('google.redirect') }}"
                class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center mb-6"
            >
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
            </a>

            {{-- Member Login --}}
            <div class="border-t border-gray-300 pt-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">Member Login</h3>
                
                <form id="member-login-form" class="space-y-4">
                    @csrf
                    <div>
                        <label for="member-username" class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                        <div class="relative">
                            <i data-lucide="user" class="absolute left-3 top-3 w-5 h-5 text-gray-400"></i>
                            <input
                                type="text"
                                id="member-username"
                                name="username"
                                placeholder="Enter member username"
                                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label for="member-password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div class="relative">
                            <i data-lucide="lock" class="absolute left-3 top-3 w-5 h-5 text-gray-400"></i>
                            <input
                                type="password"
                                id="member-password"
                                name="password"
                                placeholder="Enter member password"
                                class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                            <button
                                type="button"
                                id="toggle-member-password"
                                class="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                <i data-lucide="eye" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        id="member-login-button"
                        class="w-full bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                    >
                        <i data-lucide="user" class="w-5 h-5 mr-2"></i>
                        <span>Login as Member</span>
                    </button>
                </form>
            </div>
        </div>
    </div>

    <script src="{{ asset('js/app.js') }}"></script>
    <script>
        lucide.createIcons();

        // WhatsApp Login Logic
        const whatsappPhoneInput = document.getElementById('whatsapp-phone');
        const sendOtpButton = document.getElementById('send-otp-button');

        sendOtpButton.addEventListener('click', async function() {
            const phoneNumber = whatsappPhoneInput.value;
            if (!phoneNumber) {
                showToast('error', 'Error', 'Please enter your WhatsApp number.');
                return;
            }

            sendOtpButton.disabled = true;
            sendOtpButton.querySelector('span').textContent = 'Sending...';

            try {
                const response = await fetch('{{ route('whatsapp.send_otp') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ phone: phoneNumber })
                });
                const result = await response.json();

                if (result.success) {
                    showToast('success', 'Success', result.message);
                    // Here you would typically show an OTP verification input
                    // For now, we'll just show a success message.
                } else {
                    showToast('error', 'Error', result.message);
                }
            } catch (error) {
                console.error('Error sending OTP:', error);
                showToast('error', 'Error', 'Failed to send OTP. Please try again.');
            } finally {
                sendOtpButton.disabled = false;
                sendOtpButton.querySelector('span').textContent = 'Send OTP via WhatsApp';
            }
        });

        // Member Login Logic
        const memberLoginForm = document.getElementById('member-login-form');
        const memberLoginButton = document.getElementById('member-login-button');
        const memberPasswordInput = document.getElementById('member-password');
        const toggleMemberPassword = document.getElementById('toggle-member-password');

        toggleMemberPassword.addEventListener('click', function () {
            const type = memberPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            memberPasswordInput.setAttribute('type', type);
            this.querySelector('i').setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
            lucide.createIcons();
        });

        memberLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            memberLoginButton.disabled = true;
            memberLoginButton.querySelector('span').textContent = 'Signing in...';

            const formData = new FormData(memberLoginForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('{{ route('member.login') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (response.ok && result.success) {
                    showToast('success', 'Login Successful!', 'Welcome!');
                    window.location.href = result.redirect;
                } else {
                    showToast('error', 'Login Failed', result.message);
                }
            } catch (error) {
                console.error('Member login error:', error);
                showToast('error', 'Error', 'An unexpected error occurred.');
            } finally {
                memberLoginButton.disabled = false;
                memberLoginButton.querySelector('span').textContent = 'Login as Member';
            }
        });
    </script>
</body>
</html>