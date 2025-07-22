<?php
// app/Http/Controllers/Admin/PermissionsController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;

class PermissionsController extends Controller
{
    public function index()
    {
        $admins = Admin::with('roles')->get();
        $roles = Role::all();
        
        return response()->json([
            'admins' => $admins,
            'roles' => $roles
        ]);
    }

    public function storeAdmin(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:admins,username',
            'email' => 'required|email|max:255|unique:admins,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
        ]);

        $admin = Admin::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $admin->assignRole($validated['role']);

        return response()->json($admin->load('roles'), 201);
    }

    public function updateAdmin(Request $request, Admin $admin)
    {
        $validated = $request->validate([
            'username' => ['required','string','max:255',Rule::unique('admins')->ignore($admin->id)],
            'email' => ['required','email','max:255',Rule::unique('admins')->ignore($admin->id)],
            'role' => 'required|string|exists:roles,name',
        ]);

        $admin->update($validated);
        $admin->syncRoles($validated['role']);

        return response()->json($admin->load('roles'));
    }

    public function destroyAdmin(Admin $admin)
    {
        // Prevent deleting the last super admin or self-deletion
        if ($admin->hasRole('Super Administrator') && Admin::role('Super Administrator')->count() === 1) {
            return response()->json(['message' => 'Cannot delete the last Super Administrator.'], 403);
        }
        if ($admin->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete yourself.'], 403);
        }

        $admin->delete();

        return response()->json(null, 204);
    }
}