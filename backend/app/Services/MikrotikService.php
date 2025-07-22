<?php

namespace App\Services;

use \RouterOS\Client;
use \RouterOS\Query;
use \RouterOS\Exceptions\ConnectException;
use Illuminate\Support\Facades\Log;

class MikrotikService
{
    protected $client;
    protected $config;

    public function __construct(array $config = null)
    {
        if ($config) {
            $this->config = $config;
        } else {
            // Load from database settings as a fallback
            $this->config = [
                'host' => \App\Models\Setting::get('mikrotik_host'),
                'user' => \App\Models\Setting::get('mikrotik_user'),
                'pass' => \App\Models\Setting::get('mikrotik_pass'),
                'port' => (int)\App\Models\Setting::get('mikrotik_port', 8728),
            ];
        }
    }
    
    protected function connect()
    {
        if ($this->client) {
            return;
        }

        try {
            $this->client = new Client($this->config);
        } catch (ConnectException $e) {
            Log::error('MikroTik Connection Failed: ' . $e->getMessage());
            throw $e; // Re-throw the exception to be caught by the controller
        }
    }

    public static function testConnection(array $config)
    {
        try {
            // Temporarily create a client just for testing
            $client = new Client($config);
            return true;
        } catch (ConnectException $e) {
            Log::warning('MikroTik Test Connection Failed: ' . $e->getMessage());
            return false;
        }
    }

    public function getSystemResources()
    {
        $this->connect();
        return $this->client->query('/system/resource/print')->read();
    }
    
    public function getRouterboardInfo()
    {
        $this->connect();
        return $this->client->query('/system/routerboard/print')->read();
    }

    public function getInterfaces()
    {
        $this->connect();
        return $this->client->query('/interface/print', ['detail' => ''])->read();
    }
    
    public function getHotspotProfiles()
    {
        $this->connect();
        return $this->client->query('/ip/hotspot/profile/print')->read();
    }

    public function updateInterface($id, array $params)
    {
        $this->connect();
        $query = (new Query('/interface/set'))
            ->equal('.id', $id)
            ->equal('disabled', $params['disabled'] ? 'yes' : 'no');
            
        // You can add more parameters to update here if needed
        // ->equal('comment', $params['comment']);
            
        return $this->client->query($query)->read();
    }

    public function updateHotspotProfile($id, array $params)
    {
        $this->connect();
        $query = (new Query('/ip/hotspot/profile/set'))
            ->equal('.id', $id);
        
        foreach($params as $key => $value){
             $query->equal($key, $value);
        }
            
        return $this->client->query($query)->read();
    }

    public function addHotspotProfile(array $params)
    {
        $this->connect();
        $query = new Query('/ip/hotspot/profile/add');
        
        foreach($params as $key => $value){
             $query->equal($key, $value);
        }
        
        return $this->client->query($query)->read();
    }
    
    public function removeHotspotProfile($id)
    {
        $this->connect();
        $query = (new Query('/ip/hotspot/profile/remove'))
            ->equal('.id', $id);
            
        return $this->client->query($query)->read();
    }

    public function reboot()
    {
        $this->connect();
        return $this->client->query('/system/reboot')->read();
    }

    /**
     * Get an active hotspot user by their IP address.
     *
     * @param string $ip
     * @return array|null
     */
    public function getActiveHotspotUserByIp(string $ip): ?array
    {
        $this->connect();
        $query = (new Query('/ip/hotspot/active/print'))
            ->where('address', $ip);
        
        $response = $this->client->query($query)->read();
        
        // Return the first user found at that IP, or null if not found
        return $response[0] ?? null;
    }
    
    /**
     * Remove (disconnect) an active hotspot user.
     *
     * @param string $id The .id of the active user in MikroTik
     * @return array
     */
    public function removeActiveHotspotUser(string $id): array
    {
        $this->connect();
        $query = (new Query('/ip/hotspot/active/remove'))
            ->equal('.id', $id);
            
        return $this->client->query($query)->read();
    }
}