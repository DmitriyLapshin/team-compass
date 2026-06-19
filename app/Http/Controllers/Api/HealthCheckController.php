<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class HealthCheckController extends Controller
{
    public function check(): JsonResponse
    {
        $status = [
            'status' => 'healthy',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0',
            'checks' => [
                'database' => $this->checkDatabase(),
                'cache' => $this->checkCache(),
                'storage' => $this->checkStorage(),
            ],
            'services' => [
                'app_name' => config('app.name'),
                'environment' => config('app.env'),
                'debug' => config('app.debug'),
            ],
        ];

        // Если есть критическая ошибка — меняем статус
        $hasError = false;
        foreach ($status['checks'] as $check) {
            if ($check['status'] === 'error') {
                $hasError = true;
                break;
            }
        }

        if ($hasError) {
            $status['status'] = 'degraded';
            return response()->json($status, 503);
        }

        return response()->json($status, 200);
    }

    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            return [
                'status' => 'healthy',
                'connection' => config('database.default'),
                'message' => 'Подключение к БД успешно',
            ];
        } catch (\Exception $e) {
            Log::error('Health check: БД недоступна', ['error' => $e->getMessage()]);
            return [
                'status' => 'error',
                'connection' => config('database.default'),
                'message' => 'Ошибка подключения к БД: ' . $e->getMessage(),
            ];
        }
    }

    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . time();
            $value = 'ok';
            Cache::put($key, $value, 10);
            $cached = Cache::get($key);
            Cache::forget($key);

            if ($cached === $value) {
                return [
                    'status' => 'healthy',
                    'driver' => config('cache.default'),
                    'message' => 'Кэш работает корректно',
                ];
            }

            return [
                'status' => 'warning',
                'driver' => config('cache.default'),
                'message' => 'Кэш работает с задержкой',
            ];
        } catch (\Exception $e) {
            Log::error('Health check: Кэш недоступен', ['error' => $e->getMessage()]);
            return [
                'status' => 'error',
                'driver' => config('cache.default'),
                'message' => 'Ошибка кэша: ' . $e->getMessage(),
            ];
        }
    }

    private function checkStorage(): array
    {
        try {
            $testFile = storage_path('app/health_check.txt');
            file_put_contents($testFile, 'ok');
            $content = file_get_contents($testFile);
            unlink($testFile);

            if ($content === 'ok') {
                return [
                    'status' => 'healthy',
                    'disk' => config('filesystems.default'),
                    'message' => 'Хранилище доступно',
                ];
            }

            return [
                'status' => 'warning',
                'disk' => config('filesystems.default'),
                'message' => 'Хранилище работает с ошибками',
            ];
        } catch (\Exception $e) {
            Log::error('Health check: Хранилище недоступно', ['error' => $e->getMessage()]);
            return [
                'status' => 'error',
                'disk' => config('filesystems.default'),
                'message' => 'Ошибка хранилища: ' . $e->getMessage(),
            ];
        }
    }

    public function readiness(): JsonResponse
    {
        // Проверяем только критичные зависимости
        $db = $this->checkDatabase();
        if ($db['status'] === 'error') {
            return response()->json([
                'status' => 'not_ready',
                'message' => 'Сервис недоступен',
            ], 503);
        }

        return response()->json([
            'status' => 'ready',
            'message' => 'Сервис готов принимать запросы',
        ], 200);
    }

    public function liveness(): JsonResponse
    {
        return response()->json([
            'status' => 'alive',
            'message' => 'Сервис работает',
        ], 200);
    }
}
