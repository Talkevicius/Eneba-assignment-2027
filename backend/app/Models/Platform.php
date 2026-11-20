<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Platform extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
    ];

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'platform_id');
    }
}
