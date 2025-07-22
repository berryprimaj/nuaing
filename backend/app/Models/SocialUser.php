<?php
// app/Models/SocialUser.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialUser extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'provider',
        'provider_id',
        'ip_address',
        'mac_address',
        'connected_at',
        'disconnected_at',
        'session_duration',
        'data_usage',
        'is_active',
    ];

    protected $casts = [
        'connected_at' => 'datetime',
        'disconnected_at' => 'datetime',
        'is_active' => 'boolean',
    ];
}