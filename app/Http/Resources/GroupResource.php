<?php
// app/Http/Resources/GroupResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;

class GroupResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'owner_id'    => $this->owner_id,
            'description' => $this->description,
            'slug'        => $this->slug,
            'privacy'     => $this->privacy,
            'members'     => UserResource::collection($this->whenLoaded('users')),
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
