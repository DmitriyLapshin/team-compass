<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'key', 'name', 'description', 'is_active',
    ];

    public function sprints(): HasMany
    {
        return $this->hasMany(Sprint::class);
    }

    public function releases(): HasMany
    {
        return $this->hasMany(Release::class);
    }

    public function plans(): HasMany
    {
        return $this->hasMany(ProjectPlan::class);
    }
}
