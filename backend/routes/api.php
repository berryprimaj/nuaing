<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\Admin\SocialUsersController;
use App\Http\Controllers\Admin\MembersController;
use App\Http\Controllers\Admin\RouterConfigController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\PermissionsController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/admin/login', [ApiAuthController::class, 'login']);

Route::middleware('auth:sanctum')->prefix('admin')->name('admin.')->group(function () {
    Route::post('/logout', [ApiAuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'getDashboardData'])->name('dashboard.data');

    // Social Users Management
    Route::post('social-users/delete-range', [SocialUsersController::class, 'deleteRange'])->name('social-users.delete-range');
    Route::post('social-users/{socialUser}/send-whatsapp', [SocialUsersController::class, 'sendWhatsApp'])->name('social-users.send-whatsapp');
    Route::get('social-users/export', [SocialUsersController::class, 'export'])->name('social-users.export');
    Route::apiResource('social-users', SocialUsersController::class);

    // Members Management
    Route::apiResource('members', MembersController::class);

    // Router Configuration
    Route::prefix('router-config')->name('router-config.')->group(function () {
        Route::get('/status', [RouterConfigController::class, 'getStatus'])->name('status');
        Route::get('/interfaces', [RouterConfigController::class, 'getInterfaces'])->name('interfaces');
        Route::get('/hotspot-profiles', [RouterConfigController::class, 'getHotspotProfiles'])->name('hotspot-profiles');
        Route::post('/save', [RouterConfigController::class, 'saveConfig'])->name('save');
        Route::post('/test-connection', [RouterConfigController::class, 'testConnection'])->name('test-connection');
        Route::post('/reboot', [RouterConfigController::class, 'rebootRouter'])->name('reboot');
    });

    // Settings Management
    Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');

    // Permissions & Roles Management
    Route::prefix('permissions')->name('permissions.')->group(function () {
        Route::get('/', [PermissionsController::class, 'index'])->name('index');
        Route::post('/admins', [PermissionsController::class, 'storeAdmin'])->name('admins.store');
        Route::put('/admins/{admin}', [PermissionsController::class, 'updateAdmin'])->name('admins.update');
        Route::delete('/admins/{admin}', [PermissionsController::class, 'destroyAdmin'])->name('admins.destroy');
    });

    // Admin Profile Management
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
});