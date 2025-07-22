<?php
// app/Http/Controllers/Admin/DashboardController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SocialUser;
use App\Models\Member;
use Carbon\Carbon;
use App\Events\DashboardUpdate;

class DashboardController extends Controller
{

    public function getDashboardData()
    {
        $totalUsers = SocialUser::count();
        $newUsersToday = SocialUser::whereDate('created_at', Carbon::today())->count();
        $activeSessions = 0; // This would require more complex tracking
        $totalMembers = Member::count();

        $stats = [
            'totalUsers' => ['value' => $totalUsers],
            'activeSessions' => ['value' => $activeSessions],
            'totalMembers' => ['value' => $totalMembers],
            'newUsersToday' => ['value' => $newUsersToday],
        ];

        $recentActivity = SocialUser::latest()->take(5)->get();

        $userActivityData = SocialUser::selectRaw('DATE(created_at) as date, COUNT(*) as users')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return ['day' => Carbon::parse($item->date)->format('D'), 'users' => $item->users];
            });

        $data = [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
            'userActivityData' => $userActivityData,
        ];
        
        // Broadcast the update
        event(new DashboardUpdate($data));

        return response()->json($data);
    }
}