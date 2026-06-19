<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sprint;
use App\Models\Release;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportController extends Controller
{
    public function importSprints(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $handle = fopen($path, 'r');
        if (!$handle) {
            return response()->json(['message' => 'Не удалось открыть файл'], 400);
        }

        $headers = fgetcsv($handle, 0, ',');
        if (!$headers) {
            fclose($handle);
            return response()->json(['message' => 'Файл пустой или неверный формат'], 400);
        }

        $headers = array_map('trim', $headers);
        
        $imported = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                if (count($row) === 1 && empty($row[0])) continue;
                
                $data = array_combine($headers, $row);
                if ($data === false) {
                    $errors[] = 'Неверное количество колонок в строке: ' . implode(',', $row);
                    continue;
                }

                if (empty($data['sprint_name']) || empty($data['start_date']) || empty($data['end_date'])) {
                    $errors[] = 'Пропущены обязательные поля в строке: ' . implode(',', $row);
                    continue;
                }

                Sprint::create([
                    'name' => $data['sprint_name'],
                    'start_date' => $data['start_date'],
                    'end_date' => $data['end_date'],
                    'story_points' => (int) ($data['story_points'] ?? 0),
                    'tasks_completed' => (int) ($data['tasks_completed'] ?? 0),
                    'tasks_total' => (int) ($data['tasks_total'] ?? $data['tasks_completed'] ?? 0),
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'message' => "Успешно импортировано {$imported} записей",
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            Log::error('Ошибка импорта спринтов: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка импорта: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function importReleases(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $handle = fopen($path, 'r');
        if (!$handle) {
            return response()->json(['message' => 'Не удалось открыть файл'], 400);
        }

        $headers = fgetcsv($handle, 0, ',');
        if (!$headers) {
            fclose($handle);
            return response()->json(['message' => 'Файл пустой или неверный формат'], 400);
        }

        $headers = array_map('trim', $headers);
        
        // Проверяем обязательные поля
        $required = ['version', 'released_at'];
        foreach ($required as $field) {
            if (!in_array($field, $headers)) {
                fclose($handle);
                return response()->json([
                    'message' => "Отсутствует обязательное поле: {$field}"
                ], 400);
            }
        }

        $imported = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($handle, 0, ',')) !== false) {
                if (count($row) === 1 && empty($row[0])) continue;
                
                $data = array_combine($headers, $row);
                if ($data === false) {
                    $errors[] = 'Неверное количество колонок в строке: ' . implode(',', $row);
                    continue;
                }

                if (empty($data['version']) || empty($data['released_at'])) {
                    $errors[] = 'Пропущены обязательные поля в строке: ' . implode(',', $row);
                    continue;
                }

                Release::create([
                    'version' => $data['version'],
                    'released_at' => $data['released_at'],
                    'tasks_count' => (int) ($data['tasks_count'] ?? 0),
                    'post_release_bugs' => (int) ($data['post_release_bugs'] ?? 0),
                ]);

                $imported++;
            }

            DB::commit();
            fclose($handle);

            return response()->json([
                'success' => true,
                'imported' => $imported,
                'message' => "Успешно импортировано {$imported} релизов",
                'errors' => $errors,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            Log::error('Ошибка импорта релизов: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ошибка импорта релизов: ' . $e->getMessage(),
            ], 500);
        }
    }
}
