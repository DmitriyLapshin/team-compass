<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use Illuminate\Http\Request;

class MonteCarloController extends Controller
{
    public function simulate(Request $request)
    {
        $request->validate([
            'backlog_points' => 'required|integer|min:1',
            'simulations' => 'required|integer|min:100|max:50000',
        ]);

        $backlogPoints = (int) $request->input('backlog_points', 100);
        $simulations = (int) $request->input('simulations', 10000);
        $confidenceLevels = [50, 70, 85, 95];

        // 1. Получаем исторические скорости
        $sprints = Sprint::orderBy('id', 'asc')->get();
        $velocities = $sprints->map(function ($sprint) {
            return (int) $sprint->story_points;
        })->filter(function ($points) {
            return $points > 0;
        })->values()->toArray();

        if (empty($velocities)) {
            return response()->json([
                'message' => 'Нет данных о скорости спринтов. Импортируйте данные.',
                'velocities' => [],
                'distribution' => [],
                'confidence_intervals' => [],
                'summary' => null,
            ]);
        }

        // 2. Запускаем симуляцию
        $results = [];
        for ($i = 0; $i < $simulations; $i++) {
            $sprintsNeeded = $this->simulateOne($velocities, $backlogPoints);
            $results[] = $sprintsNeeded;
        }

        // 3. Сортируем и считаем процентили
        sort($results);
        $percentiles = [];
        foreach ($confidenceLevels as $level) {
            $index = (int) ceil(($level / 100) * count($results)) - 1;
            $percentiles[$level] = $results[$index] ?? 0;
        }

        // 4. Строим распределение (гистограмму)
        $distribution = $this->buildDistribution($results);

        return response()->json([
            'success' => true,
            'velocities' => $velocities,
            'avg_velocity' => round(array_sum($velocities) / count($velocities), 1),
            'simulations' => $simulations,
            'backlog_points' => $backlogPoints,
            'distribution' => $distribution,
            'confidence_intervals' => $percentiles,
            'summary' => [
                'best_case' => min($results),
                'worst_case' => max($results),
                'average' => round(array_sum($results) / count($results), 1),
            ],
        ]);
    }

    private function simulateOne(array $velocities, int $backlogPoints): int
    {
        $remaining = $backlogPoints;
        $sprints = 0;

        while ($remaining > 0 && $sprints < 100) { // защита от бесконечного цикла
            // Случайно выбираем скорость из истории
            $velocity = $velocities[array_rand($velocities)];
            $remaining -= $velocity;
            $sprints++;
        }

        return $sprints;
    }

    private function buildDistribution(array $results): array
    {
        // Группируем по количеству спринтов
        $distribution = [];
        foreach ($results as $sprints) {
            if (!isset($distribution[$sprints])) {
                $distribution[$sprints] = 0;
            }
            $distribution[$sprints]++;
        }

        // Сортируем по ключам (количеству спринтов)
        ksort($distribution);

        // Преобразуем в массив с процентами
        $total = count($results);
        $formatted = [];
        foreach ($distribution as $sprints => $count) {
            $formatted[] = [
                'sprints' => $sprints,
                'count' => $count,
                'percentage' => round(($count / $total) * 100, 2),
            ];
        }

        return $formatted;
    }
}
