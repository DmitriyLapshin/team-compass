<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Release extends Model
{
    protected $fillable = [
        'version', 'released_at', 'tasks_count', 'post_release_bugs'
    ];

    protected $casts = [
        'released_at' => 'date',
    ];

    // Общая стабильность: % релизов без багов
    public static function stabilityRate(): float
    {
        $total = self::count();
        if ($total === 0) return 100;

        $clean = self::where('post_release_bugs', 0)->count();
        return round(($clean / $total) * 100, 1);

    }
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
