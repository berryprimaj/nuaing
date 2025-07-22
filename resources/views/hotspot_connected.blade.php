<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connected - MikroTik Hotspot</title>
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
</head>
<body class="font-sans antialiased bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
        <div class="mx-auto w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <i data-lucide="check-circle" class="w-12 h-12 text-white"></i>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-3">You are Connected!</h1>
        <p class="text-gray-600 mb-6">Enjoy your free internet access.</p>
        <a href="https://google.com" target="_blank" class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200">
            <i data-lucide="globe" class="w-5 h-5 mr-2"></i>
            Start Browsing
        </a>
    </div>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>