<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'sprint_id', 'key', 'title', 'story_points', 
        'status', 'created_at_jira', 'resolved_at'
    ];

    protected $casts = [
        'created_at_jira' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function sprint(): BelongsTo
    {
        return $this->belongsTo(Sprint::class);
    }

    // Расчет Cycle Time в днях
    public function getCycleTimeAttribute(): ?float
    {
        if (!$this->resolved_at || !$this->created_at_jira) {
            return null;
        }
        return round($this->created_at_jira->diffInDays($this->resolved_at), 1);
    }
}