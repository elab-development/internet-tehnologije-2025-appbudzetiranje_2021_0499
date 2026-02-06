<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Http\Resources\GroupResource;

class GroupController extends Controller
{
    /**
     * List all groups.
     * Accessible only by regular users.
     */
    public function index()
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $groups = Group::all();
        return GroupResource::collection($groups);
    }

    /**
     * Create a new group.
     * Accessible only by regular users.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'privacy'     => 'required|in:public,private',
        ]);

        $group = Group::create([
            'name'        => $data['name'],
            'owner_id'    => $user->id,
            'description' => $data['description'] ?? null,
            'slug'        => Str::slug($data['name']),
            'privacy'     => $data['privacy'],
        ]);

        // Make creator a member
        $group->users()->attach($user->id);

        return new GroupResource($group->load('users'));
    }

    /**
     * Show one group by ID.
     * Accessible only by regular users.
     */
    public function show($id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $group = Group::with('users')->find($id);
        if (! $group) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        return new GroupResource($group);
    }

    /**
     * Update a group by ID.
     * Accessible only by regular users.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $group = Group::find($id);
        if (! $group) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:150',
            'description' => 'nullable|string',
            'privacy'     => 'sometimes|required|in:public,private',
        ]);

        if (isset($data['name'])) {
            $group->slug = Str::slug($data['name']);
        }

        $group->update($data);

        return new GroupResource($group->load('users'));
    }

    /**
     * Delete a group by ID.
     * Accessible only by regular users.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $group = Group::find($id);
        if (! $group) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        $group->users()->detach();
        $group->delete();

        return response()->json(['message' => 'Group deleted successfully.'], 200);
    }

    /**
     * Join a group by ID.
     * Accessible only by regular users.
     */
    public function join($id)
    {
        $user = Auth::user();
        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }
        if ($user->role !== 'regular') {
            return response()->json(['error' => 'You do not have permission.'], 403);
        }

        $group = Group::with('users')->find($id);
        if (! $group) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        // attach without duplicating
        $group->users()->syncWithoutDetaching([$user->id]);

        // reload members
        $group->load('users');

        return new GroupResource($group);
    }

}
