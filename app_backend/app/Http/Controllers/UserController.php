<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Http\Resources\UserResource;
use Symfony\Component\HttpFoundation\StreamedResponse;

class UserController extends Controller
{
    /**
     * List users (optionally filtered by ?search=).
     * Accessible by regular or administrator.
     */
    public function index(Request $request)
    {
        $me = Auth::user();
        if (! $me) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        if (! in_array($me->role, ['regular', 'administrator'])) {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $term  = trim((string) $request->query('search', ''));
        $users = User::query()
            // exclude myself so I don't add me
            ->where('id', '!=', $me->id)
            // apply search when provided; group ORs correctly
            ->when($term !== '', function ($q) use ($term) {
                $like = '%'.$term.'%';
                $q->where(function ($qq) use ($like) {
                    $qq->where('name', 'like', $like)
                    ->orWhere('surname', 'like', $like)
                    ->orWhere('email', 'like', $like);
                });
            })
            ->orderBy('name')
            ->orderBy('surname')
            ->limit(20)
            ->get();

        return UserResource::collection($users);
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

    /**
     * ADMIN: List all users with role=regular (optional ?search=).
     */
    public function adminRegulars(Request $request)
    {
        $me = Auth::user();
        if (! $me) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($me->role !== 'administrator') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $term = trim((string) $request->query('search', ''));

        $users = User::query()
            ->where('role', 'regular')
            ->when($term !== '', function ($q) use ($term) {
                $like = '%'.$term.'%';
                $q->where(function ($qq) use ($like) {
                    $qq->where('name', 'like', $like)
                    ->orWhere('surname', 'like', $like)
                    ->orWhere('email', 'like', $like);
                });
            })
            ->orderBy('name')
            ->orderBy('surname')
            ->get();

        return UserResource::collection($users);
    }

    /**
     * ADMIN: Export all regular users to CSV.
     */
    public function exportRegularsCsv(Request $request): StreamedResponse
    {
        $me = Auth::user();
        if (! $me) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($me->role !== 'administrator') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $term = trim((string) $request->query('search', ''));

        $users = User::query()
            ->where('role', 'regular')
            ->when($term !== '', function ($q) use ($term) {
                $like = '%'.$term.'%';
                $q->where(function ($qq) use ($like) {
                    $qq->where('name', 'like', $like)
                    ->orWhere('surname', 'like', $like)
                    ->orWhere('email', 'like', $like);
                });
            })
            ->orderBy('name')
            ->orderBy('surname')
            ->get(['id','name','surname','email','status','created_at']);

        $filename = 'regular-users-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($users) {
            $out = fopen('php://output', 'w');
            // Header row
            fputcsv($out, ['ID', 'Name', 'Surname', 'Email', 'Status', 'Created At']);
            foreach ($users as $u) {
                fputcsv($out, [
                    $u->id,
                    $u->name,
                    $u->surname,
                    $u->email,
                    $u->status,
                    optional($u->created_at)->toDateTimeString(),
                ]);
            }
            fclose($out);
        }, $filename, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Cache-Control'       => 'no-store, no-cache',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

}
