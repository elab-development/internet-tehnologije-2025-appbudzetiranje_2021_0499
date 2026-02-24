<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GroupMessageController extends Controller
{
    public function index($id)
    {
        $user = Auth::user();
        if (! $user) return response()->json(['error'=>'Unauthenticated.'], 401);
        if ($user->role !== 'regular') return response()->json(['error'=>'You do not have permission.'], 403);

        $group = Group::find($id);
        if (! $group) return response()->json(['error'=>'Group not found.'], 404);

        // (Optional) ensure user is a member:
        // if (! $group->users()->where('users.id',$user->id)->exists()) return response()->json(['error'=>'Not a member.'], 403);

        return GroupMessage::with('user:id,name,email,image')
            ->where('group_id',$id)
            ->orderBy('created_at')
            ->get();
    }

    public function store(Request $request, $id)
    {
        $user = Auth::user();
        if (! $user) return response()->json(['error'=>'Unauthenticated.'], 401);
        if ($user->role !== 'regular') return response()->json(['error'=>'You do not have permission.'], 403);

        $group = Group::find($id);
        if (! $group) return response()->json(['error'=>'Group not found.'], 404);

        $data = $request->validate(['message' => 'required|string|max:2000']);

        $msg = GroupMessage::create([
            'group_id' => $group->id,
            'user_id'  => $user->id,
            'message'  => $data['message'],
        ]);

        return $msg->load('user:id,name,email');
    }
}


