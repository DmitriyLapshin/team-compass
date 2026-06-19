<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Release;

class ReleaseSeeder extends Seeder
{
    public function run(): void
    {
        // Очищаем старые релизы
        Release::truncate();

        $releases = [
            ['version' => 'v1.0.0', 'released_at' => '2026-01-15', 'tasks_count' => 12, 'post_release_bugs' => 2],
            ['version' => 'v1.1.0', 'released_at' => '2026-02-01', 'tasks_count' => 8, 'post_release_bugs' => 0],
            ['version' => 'v1.2.0', 'released_at' => '2026-02-20', 'tasks_count' => 15, 'post_release_bugs' => 1],
            ['version' => 'v2.0.0', 'released_at' => '2026-03-15', 'tasks_count' => 20, 'post_release_bugs' => 3],
            ['version' => 'v2.1.0', 'released_at' => '2026-04-10', 'tasks_count' => 18, 'post_release_bugs' => 0],
            ['version' => 'v2.2.0', 'released_at' => '2026-05-05', 'tasks_count' => 25, 'post_release_bugs' => 1],
            ['version' => 'v3.0.0', 'released_at' => '2026-06-01', 'tasks_count' => 30, 'post_release_bugs' => 0],
            ['version' => 'v3.1.0', 'released_at' => '2026-07-01', 'tasks_count' => 22, 'post_release_bugs' => 2],
            ['version' => 'v3.2.0', 'released_at' => '2026-07-15', 'tasks_count' => 16, 'post_release_bugs' => 0],
            ['version' => 'v4.0.0', 'released_at' => '2026-08-01', 'tasks_count' => 35, 'post_release_bugs' => 1],
        ];

        foreach ($releases as $release) {
            Release::create($release);
        }
    }
}
