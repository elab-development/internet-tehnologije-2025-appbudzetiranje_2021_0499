<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    /**
     * List all users.
     * Accessible by regular or administrator.
     */
    public function index()
    {
        $me   = Auth::user();
        if (! $me) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $role = $me->role;
        if (in_array($role, ['regular', 'administrator'])) {
            $users = User::all();
            return UserResource::collection($users);
        }

        return response()->json(['error' => 'You do not have permission.'], 403);
    }

    /**
     * Show one user by ID.
     * Accessible only by regular users.
     */
    public function show($id)
    {
        $me   = Auth::user();
        if (! $me) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $role = $me->role;
        if ($role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        return new UserResource($user);
    }

    /**
     * Delete a user by ID.
     * Accessible only by regular users.
     */
    public function destroy($id)
    {
        $me   = Auth::user();
        if (! $me) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $role = $me->role;
        if ($role !== 'administrator') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $user = User::find($id);
        if (! $user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully.'], 200);
    }
}
