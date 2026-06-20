<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectPlan extends Model
{
    protected $fillable = [
        'project_id', 'month', 'planned_velocity', 
        'planned_tasks', 'planned_bugs',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
