<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory;
    use Notifiable;
    use HasApiTokens;

    protected $fillable = [
        'name',
        'surname',
        'email',
        'password',
        'image',
        'role',
        'phone',
        'bio',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime'
    ];

    // sada: jedan korisnik može imati više mesečnih izveštaja
    public function savingsReports()
    {
        return $this->hasMany(SavingsReport::class);
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class)
                    ->withTimestamps();
    }

    public function createdGroups()
    {
        return $this->hasMany(Group::class, 'owner_id');
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn($value) => bcrypt($value)
        );
    }
}