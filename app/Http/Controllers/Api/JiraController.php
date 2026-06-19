<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JiraController extends Controller
{
    public function testConnection(Request $request)
    {
        $request->validate([
            'domain' => 'required|string',
            'email' => 'required|email',
            'api_token' => 'required|string',
            'project_key' => 'required|string',
        ]);

        try {
            $response = $this->jiraRequest($request, '/rest/api/3/project/' . $request->input('project_key'));

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Подключение к Jira успешно!',
                    'project' => $response->json(),
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

    public function fetchSprints(Request $request)
    {
        $request->validate([
            'domain' => 'required|string',
            'email' => 'required|email',
            'api_token' => 'required|string',
            'project_key' => 'required|string',
        ]);

        try {
            // 1. Получаем доски проекта
            $boards = $this->getBoards($request);
            if (empty($boards)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Не найдено досок для проекта ' . $request->input('project_key'),
                ], 404);
            }

            $sprintData = [];
            foreach ($boards as $board) {
                // 2. Получаем спринты доски
                $sprints = $this->getSprints($request, $board['id']);
                foreach ($sprints as $sprint) {
                    if ($sprint['state'] === 'closed') {
                        // 3. Получаем задачи спринта
                        $issues = $this->getSprintIssues($request, $sprint['id']);
                        $sprintData[] = $this->processSprint($sprint, $issues);
                    }
                }
            }

            // 4. Сохраняем в БД
            $imported = $this->saveSprints($sprintData);

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'total' => count($sprintData),
                'message' => "Импортировано {$imported} спринтов из Jira",
            ]);

        } catch (\Exception $e) {
            Log::error('Ошибка Jira интеграции: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function jiraRequest(Request $request, string $endpoint)
    {
        $domain = $request->input('domain');
        $email = $request->input('email');
        $apiToken = $request->input('api_token');

        return Http::withBasicAuth($email, $apiToken)
            ->withHeaders([
                'Accept' => 'application/json',
            ])
            ->get("https://{$domain}.atlassian.net{$endpoint}");
    }

    private function getBoards(Request $request): array
    {
        $response = $this->jiraRequest($request, '/rest/agile/1.0/board?projectKeyOrId=' . $request->input('project_key'));
        if (!$response->successful()) {
            return [];
        }
        return $response->json('values', []);
    }

    private function getSprints(Request $request, int $boardId): array
    {
        $response = $this->jiraRequest($request, "/rest/agile/1.0/board/{$boardId}/sprint?state=closed,active");
        if (!$response->successful()) {
            return [];
        }
        return $response->json('values', []);
    }

    private function getSprintIssues(Request $request, int $sprintId): array
    {
        $response = $this->jiraRequest($request, "/rest/agile/1.0/sprint/{$sprintId}/issue?fields=summary,status,customfield_10026");
        if (!$response->successful()) {
            return [];
        }
        return $response->json('issues', []);
    }

    private function processSprint(array $sprint, array $issues): array
    {
        $storyPoints = 0;
        $tasksCompleted = 0;

        foreach ($issues as $issue) {
            // Поле Story Points может иметь разные ID
            $fields = $issue['fields'] ?? [];
            $points = $fields['customfield_10026'] ?? 0;
            
            if ($points > 0) {
                $storyPoints += (int) $points;
            }

            $status = $fields['status']['name'] ?? '';
            if (in_array($status, ['Done', 'Closed', 'Resolved'])) {
                $tasksCompleted++;
            }
        }

        return [
            'name' => $sprint['name'],
            'start_date' => $sprint['startDate'] ?? $sprint['createdDate'],
            'end_date' => $sprint['endDate'] ?? $sprint['completeDate'],
            'story_points' => $storyPoints,
            'tasks_completed' => $tasksCompleted,
            'tasks_total' => count($issues),
        ];
    }

    private function saveSprints(array $sprints): int
    {
        $imported = 0;
        foreach ($sprints as $sprintData) {
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
}
