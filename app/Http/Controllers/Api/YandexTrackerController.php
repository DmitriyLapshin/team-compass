<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YandexTrackerController extends Controller
{
    public function fetchSprints(Request $request)
    {
        $request->validate([
            'org_id' => 'required|string',
            'token' => 'required|string',
            'queue' => 'required|string', // Например: "PM"
        ]);

        $orgId = $request->input('org_id');
        $token = $request->input('token');
        $queue = $request->input('queue');

        try {
            // 1. Получаем спринты из Яндекс.Трекера
            $sprints = $this->getSprintsFromTracker($orgId, $token, $queue);
            
            // 2. Сохраняем их в БД
            $imported = $this->saveSprints($sprints);

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'total' => count($sprints),
                'message' => "Импортировано {$imported} спринтов из Яндекс.Трекера",
            ]);

        } catch (\Exception $e) {
            Log::error('Ошибка интеграции с Яндекс.Трекером: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getSprintsFromTracker(string $orgId, string $token, string $queue): array
    {
        // API Яндекс.Трекера
        $url = "https://api.tracker.yandex.net/v2/sprints";

        $response = Http::withHeaders([
            'Authorization' => "OAuth {$token}",
            'X-Org-Id' => $orgId,
            'Content-Type' => 'application/json',
        ])->get($url, [
            'queues' => $queue,
            'perPage' => 100,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Ошибка API: ' . $response->body());
        }

        $data = $response->json();
        $sprints = [];

        foreach ($data as $sprint) {
            // Проверяем, что спринт завершён
            if ($sprint['status'] !== 'closed') {
                continue;
            }

            // Получаем задачи спринта
            $issues = $this->getSprintIssues($orgId, $token, $sprint['id']);
            
            $storyPoints = 0;
            $tasksCompleted = 0;

            foreach ($issues as $issue) {
                // Ищем поле Story Points (может называться по-разному)
                $points = $this->extractStoryPoints($issue);
                if ($points > 0) {
                    $storyPoints += $points;
                }
                if ($issue['status']['key'] === 'done' || $issue['status']['key'] === 'closed') {
                    $tasksCompleted++;
                }
            }

            $sprints[] = [
                'name' => $sprint['name'],
                'start_date' => $sprint['startDate'] ?? $sprint['createdAt'],
                'end_date' => $sprint['endDate'] ?? $sprint['updatedAt'],
                'story_points' => $storyPoints,
                'tasks_completed' => $tasksCompleted,
                'tasks_total' => count($issues),
            ];
        }

        return $sprints;
    }

    private function getSprintIssues(string $orgId, string $token, string $sprintId): array
    {
        $url = "https://api.tracker.yandex.net/v2/issues";

        $response = Http::withHeaders([
            'Authorization' => "OAuth {$token}",
            'X-Org-Id' => $orgId,
            'Content-Type' => 'application/json',
        ])->get($url, [
            'sprint' => $sprintId,
            'perPage' => 100,
        ]);

        if (!$response->successful()) {
            return [];
        }

        return $response->json();
    }

    private function extractStoryPoints(array $issue): int
    {
        // Пытаемся найти Story Points в разных местах
        $possibleFields = ['storyPoints', 'story_points', 'customFields.storyPoints', 'customFields.story_points'];
        
        foreach ($possibleFields as $field) {
            $value = data_get($issue, $field);
            if ($value && is_numeric($value) && $value > 0) {
                return (int) $value;
            }
        }

        return 0;
    }

    private function saveSprints(array $sprints): int
    {
        $imported = 0;

        foreach ($sprints as $sprintData) {
            // Проверяем, не существует ли уже такой спринт
            $existing = Sprint::where('name', $sprintData['name'])
                ->where('start_date', $sprintData['start_date'])
                ->first();

            if (!$existing) {
                Sprint::create($sprintData);
                $imported++;
            }
        }

        return $imported;
    }

    public function testConnection(Request $request)
    {
        $request->validate([
            'org_id' => 'required|string',
            'token' => 'required|string',
            'queue' => 'required|string',
        ]);

        try {
            $url = "https://api.tracker.yandex.net/v2/queues/{$request->input('queue')}";

            $response = Http::withHeaders([
                'Authorization' => "OAuth {$request->input('token')}",
                'X-Org-Id' => $request->input('org_id'),
                'Content-Type' => 'application/json',
            ])->get($url);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Подключение к Яндекс.Трекеру успешно!',
                    'queue' => $response->json(),
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Ошибка подключения: ' . $response->body(),
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка: ' . $e->getMessage(),
            ], 500);
        }
    }
}
