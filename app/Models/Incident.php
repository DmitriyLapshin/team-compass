<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $fillable = [
        'title', 'severity', 'occurred_at', 'resolved_at', 'description'
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    // Среднее время восстановления (MTTR) в часах
    public static function averageResolutionTime(): float
    {
        $resolved = self::whereNotNull('resolved_at')->get();
        if ($resolved->isEmpty()) return 0;

        $totalHours = $resolved->sum(function ($incident) {
            return $incident->occurred_at->diffInHours($incident->resolved_at);
        });

        return round($totalHours / $resolved->count(), 1);
    }
}