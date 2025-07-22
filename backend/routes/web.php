<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HotspotController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/hotspot/login', [HotspotController::class, 'showHotspotLogin'])->name('hotspot.login');
Route::get('/hotspot/connected', [HotspotController::class, 'showConnectedPage'])->name('hotspot.connected');
Route::post('/hotspot/logout', [HotspotController::class, 'logout'])->name('hotspot.logout');


// Catch-all route for the React Admin Panel
// This must be the last web route
Route::get('/admin/{any}', function () {
    return file_get_contents(public_path('admin/index.html'));
})->where('any', '.*');


// Hotspot API Endpoints (for WhatsApp, Google, Member Login)
Route::post('/whatsapp/send-otp', [HotspotController::class, 'sendWhatsAppOTP'])
    ->name('whatsapp.send_otp')
    ->middleware('throttle:3,2'); // Maksimal 3 request per 2 menit per IP