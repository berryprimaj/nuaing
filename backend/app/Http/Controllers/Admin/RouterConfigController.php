<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\MikrotikService;
use App\Models\Setting;
use \RouterOS\Exceptions\ConnectException;

class RouterConfigController extends Controller
{
    public function getStatus()
    {
        try {
            $service = new MikrotikService(); // Uses config from DB
            $resources = $service->getSystemResources();
            $routerboard = $service->getRouterboardInfo();
            return response()->json([
                'status' => 'Connected',
                'resources' => $resources[0] ?? null,
                'routerboard' => $routerboard[0] ?? null,
            ]);
        } catch (ConnectException $e) {
            return response()->json([
                'status' => 'Disconnected',
                'message' => 'Could not connect to MikroTik router. Please check your settings.',
                'error' => $e->getMessage(),
            ], 503);
        }
    }

    public function getInterfaces()
    {
        try {
            $service = new MikrotikService();
            $interfaces = $service->getInterfaces();
            return response()->json($interfaces);
        } catch (ConnectException $e) {
            return response()->json(['error' => 'Could not fetch interfaces.'], 503);
        }
    }

    public function getHotspotProfiles()
    {
        try {
            $service = new MikrotikService();
            $profiles = $service->getHotspotProfiles();
            return response()->json($profiles);
        } catch (ConnectException $e) {
            return response()->json(['error' => 'Could not fetch hotspot profiles.'], 503);
        }
    }

    public function saveConfig(Request $request)
    {
        $validated = $request->validate([
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1',
            'user' => 'required|string|max:255',
            'pass' => 'nullable|string|max:255',
        ]);

        Setting::set('mikrotik_host', $validated['host']);
        Setting::set('mikrotik_port', $validated['port']);
        Setting::set('mikrotik_user', $validated['user']);
        Setting::set('mikrotik_pass', $validated['pass'] ?? '');

        return response()->json(['message' => 'Configuration saved successfully.']);
    }

    public function testConnection(Request $request)
    {
        $config = $request->validate([
            'host' => 'required|string',
            'port' => 'required|integer',
            'user' => 'required|string',
            'pass' => 'nullable|string',
        ]);

        if (MikrotikService::testConnection($config)) {
            return response()->json(['message' => 'Connection successful!']);
        } else {
            return response()->json(['message' => 'Connection failed.'], 400);
        }
    }

    public function rebootRouter()
    {
        try {
            $service = new MikrotikService();
            $service->reboot();
            return response()->json(['message' => 'Router is rebooting...']);
        } catch (ConnectException $e) {
            return response()->json(['error' => 'Could not connect to router to issue reboot command.'], 503);
        }
    }
}