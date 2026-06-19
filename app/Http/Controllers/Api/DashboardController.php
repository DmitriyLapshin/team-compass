<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use App\Models\Release;
use App\Models\Incident;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function metrics(Request $request): JsonResponse
    {
        $period = $request->get('period', '6');
        $project = $request->get('project', 'all');

        $sprints = Sprint::orderBy('id', 'asc')->get();
        
        $sprintData = $sprints->map(function ($sprint) {
            return [
                'name' => $sprint->name,
                'points' => $sprint->story_points,
                'tasks' => $sprint->tasks_completed,
            ];
        })->values();

        $velocity = Sprint::averageVelocity(5);
        $prevVelocity = $this->getPreviousVelocity(5);
        $trend = $this->calculateTrend($velocity, $prevVelocity);

        $backlogPoints = 200;
        $forecastSprints = Sprint::forecastSprints($backlogPoints, 5);
        $forecastWeeks = round($forecastSprints * 2, 1);

        $releases = Release::orderBy('released_at', 'asc')->get();
            
        $releaseData = $releases->map(function ($release) {
            return [
                'version' => $release->version,
                'date' => $release->released_at->format('Y-m-d'),
                'bugs' => $release->post_release_bugs,
                'tasks_count' => $release->tasks_count,
            ];
        })->values();

        $incidentsLastMonth = Incident::where('occurred_at', '>=', now()->subDays(30))->count();
        $mttr = Incident::averageResolutionTime();

        $avgCycleTime = Task::whereNotNull('resolved_at')
            ->whereNotNull('created_at_jira')
            ->get()
            ->avg('cycle_time');

        return response()->json([
            'current_velocity' => round($velocity, 1),
            'prev_velocity' => round($prevVelocity, 1),
            'trend' => $trend,
            'forecast_sprints' => $forecastSprints,
            'forecast_weeks' => $forecastWeeks,
            'avg_cycle_time' => round($avgCycleTime ?? 0, 1),
            'incidents_last_month' => $incidentsLastMonth,
            'mttr_hours' => $mttr,
            'stability_rate' => Release::stabilityRate(),
            'sprint_chart' => $sprintData,
            'release_chart' => $releaseData,
            'active_filters' => [
                'period' => $period,
                'project' => $project,
            ],
        ]);
    }

    public function burndown(Request $request)
    {
        $sprintId = $request->get('sprint_id');
        
        if (!$sprintId) {
            $lastSprint = Sprint::orderBy('id', 'desc')->first();
            if (!$lastSprint) {
                return response()->json(['message' => 'Нет данных о спринтах'], 404);
            }
            $sprintId = $lastSprint->id;
        }

        $sprint = Sprint::find($sprintId);
        if (!$sprint) {
            return response()->json(['message' => 'Спринт не найден'], 404);
        }

        $tasks = Task::where('sprint_id', $sprintId)->get();
        
        if ($tasks->isEmpty()) {
            return $this->generateDemoBurndown($sprint);
        }

        $totalTasks = $tasks->count();
        $startDate = $sprint->start_date;
        $endDate = $sprint->end_date;
        $days = $startDate->diffInDays($endDate) + 1;

        $burndownData = [];
        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $remaining = $tasks->filter(function ($task) use ($date) {
                return !$task->resolved_at || $task->resolved_at > $date;
            })->count();
            
            $burndownData[] = [
                'day' => $i + 1,
                'date' => $date->format('Y-m-d'),
                'remaining' => $remaining,
                'ideal' => max(0, $totalTasks - ($totalTasks / $days) * ($i + 1)),
            ];
        }

        return response()->json([
            'sprint' => $sprint->name,
            'total_tasks' => $totalTasks,
            'data' => $burndownData,
        ]);
    }

    public function sprintsList()
    {
        $sprints = Sprint::orderBy('id', 'desc')->get(['id', 'name', 'start_date', 'end_date']);
        
        return response()->json([
            'sprints' => $sprints->map(function ($sprint) {
                return [
                    'id' => $sprint->id,
                    'name' => $sprint->name,
                    'start_date' => $sprint->start_date->format('Y-m-d'),
                    'end_date' => $sprint->end_date->format('Y-m-d'),
                ];
            }),
        ]);
    }

    public function leadCycleTime(Request $request)
    {
        $sprintId = $request->get('sprint_id');
        
        $query = Task::whereNotNull('resolved_at')
            ->whereNotNull('created_at_jira');
        
        if ($sprintId) {
            $query->where('sprint_id', $sprintId);
        }
        
        $tasks = $query->get();
        
        if ($tasks->isEmpty()) {
            return $this->generateDemoLeadCycleData();
        }
        
        $leadTimes = [];
        $cycleTimes = [];
        $distribution = [];
        
        foreach ($tasks as $task) {
            $created = $task->created_at_jira;
            $resolved = $task->resolved_at;
            
            $leadTime = $created->diffInHours($resolved);
            $leadTimes[] = $leadTime;
            
            $cycleTime = $leadTime * 0.6;
            $cycleTimes[] = $cycleTime;
            
            $days = ceil($leadTime / 24);
            $key = $days <= 1 ? '1 день' : ($days <= 3 ? '2-3 дня' : ($days <= 7 ? '4-7 дней' : '> 7 дней'));
            if (!isset($distribution[$key])) {
                $distribution[$key] = 0;
            }
            $distribution[$key]++;
        }
        
        return response()->json([
            'avg_lead_time' => round(array_sum($leadTimes) / count($leadTimes), 1),
            'avg_cycle_time' => round(array_sum($cycleTimes) / count($cycleTimes), 1),
            'total_tasks' => count($tasks),
            'distribution' => $this->formatDistribution($distribution),
            'lead_times' => $leadTimes,
            'cycle_times' => $cycleTimes,
        ]);
    }

    public function comparePeriods(Request $request)
    {
        $period = $request->get('period', '6');
        $sprints = Sprint::orderBy('id', 'asc')->get();
        
        if ($sprints->isEmpty()) {
            return response()->json([
                'message' => 'Нет данных для сравнения',
                'current' => [],
                'previous' => [],
            ]);
        }

        $total = $sprints->count();
        $half = ceil($total / 2);
        
        $currentSprints = $sprints->slice(-$half);
        $previousSprints = $sprints->slice(0, $half);
        
        $currentAvg = $currentSprints->avg('story_points');
        $previousAvg = $previousSprints->avg('story_points');
        
        $currentTasks = $currentSprints->sum('tasks_completed');
        $previousTasks = $previousSprints->sum('tasks_completed');
        
        return response()->json([
            'current' => [
                'name' => 'Последние спринты',
                'avg_velocity' => round($currentAvg, 1),
                'total_tasks' => $currentTasks,
                'sprint_count' => $currentSprints->count(),
                'sprints' => $currentSprints->map(function ($sprint) {
                    return [
                        'name' => $sprint->name,
                        'points' => $sprint->story_points,
                        'tasks' => $sprint->tasks_completed,
                    ];
                }),
            ],
            'previous' => [
                'name' => 'Более ранние спринты',
                'avg_velocity' => round($previousAvg, 1),
                'total_tasks' => $previousTasks,
                'sprint_count' => $previousSprints->count(),
                'sprints' => $previousSprints->map(function ($sprint) {
                    return [
                        'name' => $sprint->name,
                        'points' => $sprint->story_points,
                        'tasks' => $sprint->tasks_completed,
                    ];
                }),
            ],
            'comparison' => [
                'velocity_change' => $currentAvg > $previousAvg ? 'up' : 'down',
                'velocity_percent' => $previousAvg > 0 
                    ? round((($currentAvg - $previousAvg) / $previousAvg) * 100, 1)
                    : 0,
            ],
        ]);
    }

    public function anomalies()
    {
        $result = [
            'velocity_anomalies' => $this->detectVelocityAnomalies(),
            'release_anomalies' => $this->detectReleaseAnomalies(),
            'task_anomalies' => $this->detectTaskAnomalies(),
            'summary' => [],
        ];
        
        $result['summary'] = [
            'total_anomalies' => count($result['velocity_anomalies']) + 
                                 count($result['release_anomalies']) + 
                                 count($result['task_anomalies']),
            'has_critical' => collect($result['velocity_anomalies'])->contains('severity', 'critical') ||
                              collect($result['release_anomalies'])->contains('severity', 'critical') ||
                              collect($result['task_anomalies'])->contains('severity', 'critical'),
        ];
        
        return response()->json($result);
    }

    public function releaseTimeline()
    {
        $releases = Release::orderBy('released_at', 'asc')->get();
        
        if ($releases->isEmpty()) {
            return response()->json([
                'message' => 'Нет данных о релизах',
                'releases' => [],
                'total' => 0,
                'avg_bugs' => 0,
            ]);
        }

        $timeline = $releases->map(function ($release) {
            $status = $release->post_release_bugs === 0 
                ? 'success' 
                : ($release->post_release_bugs <= 2 ? 'warning' : 'danger');
            
            return [
                'version' => $release->version,
                'date' => $release->released_at->format('Y-m-d'),
                'timestamp' => $release->released_at->timestamp,
                'tasks_count' => $release->tasks_count,
                'bugs' => $release->post_release_bugs,
                'status' => $status,
                'label' => $release->version . ($release->post_release_bugs > 0 ? " ({$release->post_release_bugs}🐛)" : ' ✅'),
            ];
        });

        return response()->json([
            'releases' => $timeline,
            'total' => $timeline->count(),
            'avg_bugs' => round($timeline->avg('bugs'), 1),
        ]);
    }

    public function monthOverMonth()
    {
        $sprints = Sprint::orderBy('id', 'asc')->get();
        
        if ($sprints->isEmpty()) {
            return response()->json([
                'message' => 'Нет данных для сравнения',
                'data' => [],
            ]);
        }

        $monthlyData = [];
        foreach ($sprints as $sprint) {
            $month = $sprint->start_date->format('Y-m');
            $monthLabel = $sprint->start_date->format('M Y');
            
            if (!isset($monthlyData[$month])) {
                $monthlyData[$month] = [
                    'month' => $monthLabel,
                    'velocity' => 0,
                    'tasks' => 0,
                    'sprint_count' => 0,
                    'points_total' => 0,
                ];
            }
            
            $monthlyData[$month]['points_total'] += $sprint->story_points;
            $monthlyData[$month]['tasks'] += $sprint->tasks_completed;
            $monthlyData[$month]['sprint_count']++;
        }

        foreach ($monthlyData as &$data) {
            $data['velocity'] = $data['sprint_count'] > 0 
                ? round($data['points_total'] / $data['sprint_count'], 1) 
                : 0;
        }

        $sorted = array_values($monthlyData);
        
        $result = [];
        $prevVelocity = null;
        $prevTasks = null;
        
        foreach ($sorted as $i => &$item) {
            if ($prevVelocity !== null) {
                $item['velocity_change'] = $prevVelocity > 0 
                    ? round((($item['velocity'] - $prevVelocity) / $prevVelocity) * 100, 1)
                    : 0;
            } else {
                $item['velocity_change'] = 0;
            }
            
            if ($prevTasks !== null) {
                $item['tasks_change'] = $prevTasks > 0 
                    ? round((($item['tasks'] - $prevTasks) / $prevTasks) * 100, 1)
                    : 0;
            } else {
                $item['tasks_change'] = 0;
            }
            
            $prevVelocity = $item['velocity'];
            $prevTasks = $item['tasks'];
        }

        return response()->json([
            'data' => $sorted,
            'total_months' => count($sorted),
            'current_velocity' => $sorted[count($sorted) - 1]['velocity'] ?? 0,
            'trend' => count($sorted) > 1 
                ? ($sorted[count($sorted) - 1]['velocity'] > $sorted[0]['velocity'] ? 'up' : 'down')
                : 'neutral',
        ]);
    }

    private function detectVelocityAnomalies(): array
    {
        $sprints = Sprint::orderBy('id', 'asc')->get();
        
        if ($sprints->count() < 3) {
            return [];
        }
        
        $velocities = $sprints->pluck('story_points')->filter()->values();
        $avg = $velocities->avg();
        $stdDev = $this->calculateStdDev($velocities->toArray(), $avg);
        
        $anomalies = [];
        foreach ($sprints as $sprint) {
            if ($sprint->story_points == 0) continue;
            
            $zScore = ($sprint->story_points - $avg) / ($stdDev ?: 1);
            $severity = 'normal';
            $message = '';
            
            if (abs($zScore) > 2.5) {
                $severity = 'critical';
                $message = $zScore > 0 
                    ? "Аномально высокая скорость ({$sprint->story_points} SP, средняя {$avg})"
                    : "Аномально низкая скорость ({$sprint->story_points} SP, средняя {$avg})";
            } elseif (abs($zScore) > 1.5) {
                $severity = 'warning';
                $message = $zScore > 0 
                    ? "Выше обычного ({$sprint->story_points} SP, средняя {$avg})"
                    : "Ниже обычного ({$sprint->story_points} SP, средняя {$avg})";
            }
            
            if ($severity !== 'normal') {
                $anomalies[] = [
                    'type' => 'velocity',
                    'sprint_name' => $sprint->name,
                    'value' => $sprint->story_points,
                    'avg' => round($avg, 1),
                    'z_score' => round($zScore, 2),
                    'severity' => $severity,
                    'message' => $message,
                    'date' => $sprint->start_date->format('Y-m-d'),
                ];
            }
        }
        
        return $anomalies;
    }

    private function detectReleaseAnomalies(): array
    {
        $releases = Release::orderBy('released_at', 'asc')->get();
        
        if ($releases->count() < 3) {
            return [];
        }
        
        $bugs = $releases->pluck('post_release_bugs')->filter()->values();
        if ($bugs->isEmpty()) {
            return [];
        }
        
        $avg = $bugs->avg();
        $stdDev = $this->calculateStdDev($bugs->toArray(), $avg);
        
        $anomalies = [];
        foreach ($releases as $release) {
            $zScore = ($release->post_release_bugs - $avg) / ($stdDev ?: 1);
            $severity = 'normal';
            $message = '';
            
            if (abs($zScore) > 2.5) {
                $severity = 'critical';
                $message = "Критически много багов после релиза ({$release->post_release_bugs} багов, средняя {$avg})";
            } elseif (abs($zScore) > 1.5) {
                $severity = 'warning';
                $message = "Больше обычного ({$release->post_release_bugs} багов, средняя {$avg})";
            }
            
            if ($severity !== 'normal') {
                $anomalies[] = [
                    'type' => 'release',
                    'version' => $release->version,
                    'value' => $release->post_release_bugs,
                    'avg' => round($avg, 1),
                    'z_score' => round($zScore, 2),
                    'severity' => $severity,
                    'message' => $message,
                    'date' => $release->released_at->format('Y-m-d'),
                ];
            }
        }
        
        return $anomalies;
    }

    private function detectTaskAnomalies(): array
    {
        $tasks = Task::whereNotNull('resolved_at')
            ->whereNotNull('created_at_jira')
            ->get();
        
        if ($tasks->count() < 5) {
            return [];
        }
        
        $cycleTimes = [];
        foreach ($tasks as $task) {
            $cycleTime = $task->created_at_jira->diffInHours($task->resolved_at);
            $cycleTimes[] = $cycleTime;
        }
        
        $avg = array_sum($cycleTimes) / count($cycleTimes);
        $stdDev = $this->calculateStdDev($cycleTimes, $avg);
        
        $anomalies = [];
        foreach ($tasks as $task) {
            $cycleTime = $task->created_at_jira->diffInHours($task->resolved_at);
            $zScore = ($cycleTime - $avg) / ($stdDev ?: 1);
            $severity = 'normal';
            $message = '';
            
            if (abs($zScore) > 2.5) {
                $severity = 'critical';
                $message = "Аномально долгая задача (~" . round($cycleTime / 24, 1) . " дней, средняя ~" . round($avg / 24, 1) . " дней)";
            } elseif (abs($zScore) > 1.5) {
                $severity = 'warning';
                $message = "Дольше обычного (~" . round($cycleTime / 24, 1) . " дней, средняя ~" . round($avg / 24, 1) . " дней)";
            }
            
            if ($severity !== 'normal') {
                $anomalies[] = [
                    'type' => 'task',
                    'task_key' => $task->key ?? 'N/A',
                    'task_title' => substr($task->title, 0, 50),
                    'value' => round($cycleTime / 24, 1),
                    'avg' => round($avg / 24, 1),
                    'z_score' => round($zScore, 2),
                    'severity' => $severity,
                    'message' => $message,
                ];
            }
        }
        
        usort($anomalies, function ($a, $b) {
            $order = ['critical' => 0, 'warning' => 1];
            return ($order[$a['severity']] ?? 2) - ($order[$b['severity']] ?? 2);
        });
        
        return array_slice($anomalies, 0, 10);
    }

    private function calculateStdDev(array $values, float $mean): float
    {
        if (count($values) < 2) {
            return 0;
        }
        
        $variance = array_sum(array_map(function ($x) use ($mean) {
            return pow($x - $mean, 2);
        }, $values)) / count($values);
        
        return sqrt($variance);
    }

    private function generateDemoBurndown($sprint)
    {
        $totalTasks = rand(15, 30);
        $startDate = $sprint->start_date;
        $endDate = $sprint->end_date;
        $days = $startDate->diffInDays($endDate) + 1;

        $burndownData = [];
        $remaining = $totalTasks;

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            
            if ($i < $days * 0.7) {
                $burned = rand(0, 2);
            } else {
                $burned = rand(0, 1);
            }
            $remaining = max(0, $remaining - $burned);
            
            $burndownData[] = [
                'day' => $i + 1,
                'date' => $date->format('Y-m-d'),
                'remaining' => $remaining,
                'ideal' => max(0, $totalTasks - ($totalTasks / $days) * ($i + 1)),
            ];
        }

        return response()->json([
            'sprint' => $sprint->name . ' (демо)',
            'total_tasks' => $totalTasks,
            'data' => $burndownData,
        ]);
    }

    private function generateDemoLeadCycleData()
    {
        $leadTimes = [];
        $cycleTimes = [];
        $distribution = [];
        
        for ($i = 0; $i < 30; $i++) {
            $leadTime = rand(4, 120);
            $leadTimes[] = $leadTime;
            $cycleTime = $leadTime * (0.4 + (rand(0, 100) / 100) * 0.4);
            $cycleTimes[] = $cycleTime;
            
            $days = ceil($leadTime / 24);
            $key = $days <= 1 ? '1 день' : ($days <= 3 ? '2-3 дня' : ($days <= 7 ? '4-7 дней' : '> 7 дней'));
            if (!isset($distribution[$key])) {
                $distribution[$key] = 0;
            }
            $distribution[$key]++;
        }
        
        return response()->json([
            'avg_lead_time' => round(array_sum($leadTimes) / count($leadTimes), 1),
            'avg_cycle_time' => round(array_sum($cycleTimes) / count($cycleTimes), 1),
            'total_tasks' => count($leadTimes),
            'distribution' => $this->formatDistribution($distribution),
            'lead_times' => $leadTimes,
            'cycle_times' => $cycleTimes,
            'is_demo' => true,
        ]);
    }

    private function formatDistribution(array $distribution): array
    {
        $total = array_sum($distribution);
        $formatted = [];
        $order = ['1 день', '2-3 дня', '4-7 дней', '> 7 дней'];
        
        foreach ($order as $key) {
            $count = $distribution[$key] ?? 0;
            $formatted[] = [
                'name' => $key,
                'value' => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
            ];
        }
        
        return $formatted;
    }

    private function getPreviousVelocity(int $lastSprints = 5): float
    {
        $sprints = Sprint::orderBy('id', 'desc')
            ->skip($lastSprints)
            ->limit($lastSprints)
            ->where('story_points', '>', 0)
            ->get();

        if ($sprints->isEmpty()) {
            return 0;
        }

        return round($sprints->avg('story_points'), 1);
    }

    private function calculateTrend(float $current, float $previous): array
    {
        if ($previous == 0) {
            return [
                'direction' => 'neutral',
                'percent' => 0,
                'label' => 'Нет данных',
            ];
        }

        $percent = round((($current - $previous) / $previous) * 100, 1);
        $direction = $percent > 0 ? 'up' : ($percent < 0 ? 'down' : 'neutral');
        $label = $direction === 'up' ? 'рост' : ($direction === 'down' ? 'падение' : 'стабильно');

        return [
            'direction' => $direction,
            'percent' => abs($percent),
            'label' => $label,
        ];
    }
}
