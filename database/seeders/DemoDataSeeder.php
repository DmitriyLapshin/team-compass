<?php

namespace Database\Seeders;

use App\Models\Sprint;
use App\Models\Release;
use App\Models\Incident;
use App\Models\Task;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Спринты
        $sprintNames = ['Sprint 18', 'Sprint 19', 'Sprint 20', 'Sprint 21', 'Sprint 22'];
        $points = [32, 28, 35, 30, 38];
        $tasks = [12, 10, 14, 11, 15];

        foreach ($sprintNames as $i => $name) {
            Sprint::create([
                'name' => $name,
                'start_date' => now()->subWeeks((5 - $i) * 2),
                'end_date' => now()->subWeeks((5 - $i) * 2 - 2),
                'story_points' => $points[$i],
                'tasks_completed' => $tasks[$i],
                'tasks_total' => $tasks[$i] + rand(2, 5),
            ]);
        }

        // Релизы
        $versions = ['v2.0.0', 'v2.1.0', 'v2.1.1', 'v2.2.0', 'v2.3.0'];
        $bugs = [2, 0, 1, 3, 0];
        foreach ($versions as $i => $version) {
            Release::create([
                'version' => $version,
                'released_at' => now()->subWeeks((5 - $i) * 2),
                'tasks_count' => rand(8, 20),
                'post_release_bugs' => $bugs[$i],
            ]);
        }

        // Инциденты
        Incident::create([
            'title' => 'Падение очереди RabbitMQ',
            'severity' => 'P1',
            'occurred_at' => now()->subDays(5),
            'resolved_at' => now()->subDays(5)->addHours(2),
        ]);

        Incident::create([
            'title' => 'Ошибка авторизации в B2B',
            'severity' => 'P2',
            'occurred_at' => now()->subDays(3),
            'resolved_at' => now()->subDays(3)->addHours(1),
        ]);
    }
}