<?php
// app/Http/Resources/UserResource.php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
       return [
            'id'         => $this->id,
            'name'       => $this->name,
            'surname'    => $this->surname,
            'email'      => $this->email,
            'image'      => $this->image,
            'role'       => $this->role,
           'phone'      => $this->phone,
            'bio'        => $this->bio,
            'settings'   => $this->settings,
            'status'     => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
        /* return [
            'id'         => $this->id ?? null,
            'name'       => $this->name ?? null,
            'surname'    => $this->surname ?? null,
            'email'      => $this->email ?? null,
            'image'      => $this->image ?? null,
            'role'       => $this->role ?? null,
            'phone'      => $this->phone ?? null,
            'bio'        => $this->bio ?? null,
            'status'     => $this->status ?? null,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toDateTimeString() : null,
        ];*/
    }
}
