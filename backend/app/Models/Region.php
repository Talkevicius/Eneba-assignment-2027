<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'code',
    ];

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class, 'region_id');
    }
}
