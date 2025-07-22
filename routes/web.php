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

// Hotspot Login Page
Route::get('/', [HotspotController::class, 'showHotspotLogin'])->name('hotspot.login');

// Hotspot API Endpoints (for WhatsApp, Google, Member Login)
Route::post('/whatsapp/send-otp', [HotspotController::class, 'sendWhatsAppOTP'])->name('whatsapp.send_otp');
Route::post('/whatsapp/verify-otp', [HotspotController::class, 'verifyWhatsAppOTP'])->name('whatsapp.verify_otp');
Route::get('/auth/google', [HotspotController::class, 'redirectToGoogle'])->name('google.redirect');
Route::get('/auth/google/callback', [HotspotController::class, 'handleGoogleCallback'])->name('google.callback');
Route::post('/member/login', [HotspotController::class, 'memberLogin'])->name('member.login');

// Connected page (after successful hotspot login)
Route::get('/connected', [HotspotController::class, 'showConnectedPage'])->name('hotspot.connected');

// Admin Login
// Route::prefix('admin')->group(function () {
//     Route::get('/login', [AdminController::class, 'showLoginForm'])->name('admin.login');
//     Route::post('/login', [AdminController::class, 'login']);
//     Route::post('/logout', [AdminController::class, 'logout'])->name('admin.logout');

//     // Admin Protected Routes
//     Route::middleware(['admin'])->group(function () { // Use 'admin' middleware
//         Route::get('/dashboard', [DashboardController::class, 'showDashboard'])->name('admin.dashboard');
        
//         Route::get('/social-users', [SocialUsersController::class, 'showSocialUsers'])->name('admin.social_users');
//         Route::post('/social-users/{id}', [SocialUsersController::class, 'update']); // For PUT/PATCH
//         Route::delete('/social-users/{id}', [SocialUsersController::class, 'destroy']);
//         Route::post('/social-users/{id}/send-whatsapp', [SocialUsersController::class, 'sendWhatsApp']);

//         Route::get('/members', [MembersController::class, 'showMembersManagement'])->name('admin.members');
//         Route::post('/members', [MembersController::class, 'store'])->name('admin.members.store');
//         Route::post('/members/{id}', [MembersController::class, 'update']); // For PUT/PATCH
//         Route::delete('/members/{id}', [MembersController::class, 'destroy']);

//         Route::get('/router-config', [RouterConfigController::class, 'showRouterConfiguration'])->name('admin.router_config');
//         Route::post('/router-config/save', [RouterConfigController::class, 'saveMikrotikConfig'])->name('admin.router_config.save');
//         Route::post('/router-config/test-connection', [RouterConfigController::class, 'testConnection'])->name('admin.router_config.test_connection');
//         Route::post('/router-config/interfaces/{name}', [RouterConfigController::class, 'updateInterface']); // For PUT/PATCH
//         Route::delete('/router-config/interfaces/{name}', [RouterConfigController::class, 'deleteInterface']);

//         Route::get('/settings', [SettingsController::class, 'showApplicationSettings'])->name('admin.settings');
//         Route::post('/settings/update', [SettingsController::class, 'updateSettings'])->name('admin.settings.update');

//         Route::get('/permissions', [PermissionsController::class, 'showRolesAndPermissions'])->name('admin.permissions');
//         Route::post('/permissions/admins', [PermissionsController::class, 'storeAdmin'])->name('admin.permissions.store_admin');
//         Route::post('/permissions/admins/{id}', [PermissionsController::class, 'updateAdmin']); // For PUT/PATCH
//         Route::delete('/permissions/admins/{id}', [PermissionsController::class, 'destroyAdmin']);

//         Route::get('/profile', [ProfileController::class, 'showAdminProfile'])->name('admin.profile');
//         Route::post('/profile/update', [ProfileController::class, 'updateProfile'])->name('admin.profile.update');
//         Route::post('/profile/update-password', [ProfileController::class, 'updatePassword'])->name('admin.profile.update_password');
//     });
// });

// Fallback route for any unmatched paths (redirect to hotspot login)
Route::fallback(function () {
    return redirect()->route('hotspot.login');
});