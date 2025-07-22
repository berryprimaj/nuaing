<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SocialUser;
use Illuminate\Http\Request;
use App\Services\FonteService;
use Carbon\Carbon;
use Illuminate\Http\Response;

class SocialUsersController extends Controller
{
    public function index(Request $request)
    {
        $query = SocialUser::query();

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('whatsapp_number', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('provider') && $request->provider !== 'All Providers') {
            $query->where('provider', $request->provider);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startDate = Carbon::parse($request->start_date)->startOfDay();
            $endDate = Carbon::parse($request->end_date)->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }

        $users = $query->latest()->paginate($request->input('per_page', 15));

        return response()->json($users);
    }

    public function show(SocialUser $socialUser)
    {
        return response()->json($socialUser);
    }

    public function update(Request $request, SocialUser $socialUser)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|nullable|email|unique:social_users,email,' . $socialUser->id,
            'whatsapp_number' => 'sometimes|nullable|string|unique:social_users,whatsapp_number,' . $socialUser->id,
        ]);

        $socialUser->update($validated);

        return response()->json($socialUser);
    }

    public function destroy(SocialUser $socialUser)
    {
        $socialUser->delete();
        return response()->json(null, 204);
    }

    public function deleteRange(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = Carbon::parse($validated['start_date'])->startOfDay();
        $endDate = Carbon::parse($validated['end_date'])->endOfDay();

        $count = SocialUser::whereBetween('created_at', [$startDate, $endDate])->delete();

        return response()->json(['message' => "Successfully deleted {$count} users."]);
    }

    public function sendWhatsApp(Request $request, SocialUser $socialUser, FonteService $fonteService)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        if (!$socialUser->whatsapp_number) {
            return response()->json(['error' => 'User does not have a WhatsApp number.'], 422);
        }

        try {
            $response = $fonteService->sendMessage($socialUser->whatsapp_number, $validated['message']);
            return response()->json($response);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send message: ' . $e->getMessage()], 500);
        }
    }
    
    public function export(Request $request)
    {
        $fileName = 'social-users-' . now()->format('Y-m-d') . '.csv';
        
        // Apply the same filters from index() for consistency
        $query = SocialUser::query();

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('whatsapp_number', 'like', "%{$searchTerm}%");
            });
        }
        if ($request->filled('provider') && $request->provider !== 'All Providers') {
            $query->where('provider', $request->provider);
        }
        $users = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Name', 'Email', 'WhatsApp Number', 'Provider', 'Status', 'IP Address', 'Connected At'];

        $callback = function() use($users, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($users as $user) {
                fputcsv($file, [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->whatsapp_number,
                    $user->provider,
                    $user->status,
                    $user->ip_address,
                    $user->created_at->toDateTimeString(),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}