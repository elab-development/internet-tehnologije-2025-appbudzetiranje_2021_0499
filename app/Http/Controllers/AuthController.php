<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        // Validate input
        $request->validate([
            'name'     => 'required|string|max:150',
            'surname'  => 'required|string|max:150',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role'     => 'in:regular,administrator',
            'image'    => 'nullable|url',
            'phone'    => 'nullable|string|max:50',
            'bio'      => 'nullable|string',
        ]);

        // Create user
        $user = User::create([
            'name'     => $request->name,
            'surname'  => $request->surname,
            'email'    => $request->email,
            'password' => $request->password, // hashed by model mutator
            'role'     => $request->role   ?? 'regular',
            'image'    => $request->image ?? null,
            'phone'    => $request->phone ?? null,
            'bio'      => $request->bio   ?? null,
            'status'   => 'active',
        ]);

        // Generate API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully.',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /**
     * Log in a user.
     */
    public function login(Request $request)
    {
        // Validate input
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        // Attempt login
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials.'
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Ensure account is active
        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Account is not active.'
            ], 403);
        }

        // Issue new token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'surname'  => $user->surname,
                'email'    => $user->email,
                'role'     => $user->role,
                'image'    => $user->image,
                'phone'    => $user->phone,
                'bio'      => $user->bio,
                'status'   => $user->status,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Log out the current user.
     */
    public function logout(Request $request)
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
