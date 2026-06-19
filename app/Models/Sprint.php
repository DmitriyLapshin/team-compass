<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sprint extends Model
{
    protected $fillable = [
        'name', 'start_date', 'end_date', 
        'story_points', 'tasks_completed', 'tasks_total'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public static function averageVelocity(int $lastSprints = 5): float
    {
        $sprints = self::orderBy('id', 'desc')
            ->limit($lastSprints)
            ->where('story_points', '>', 0)
            ->get();

        if ($sprints->isEmpty()) return 0;

        return $sprints->avg('story_points');
    }

    public static function forecastSprints(int $remainingPoints, int $lastSprints = 5): float
    {
        $velocity = self::averageVelocity($lastSprints);
        if ($velocity <= 0) return 0;
        return round($remainingPoints / $velocity, 1);
    }
}
