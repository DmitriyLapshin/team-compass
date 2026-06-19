<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\MonteCarloController;
use App\Http\Controllers\Api\YandexTrackerController;
use App\Http\Controllers\Api\HealthCheckController;
use App\Http\Controllers\Api\JiraController;

// Health Check
Route::get('/health', [HealthCheckController::class, 'check']);
Route::get('/health/readiness', [HealthCheckController::class, 'readiness']);
Route::get('/health/liveness', [HealthCheckController::class, 'liveness']);

// Основные API
Route::get('/metrics', [DashboardController::class, 'metrics']);
Route::get('/burndown', [DashboardController::class, 'burndown']);
Route::get('/sprints-list', [DashboardController::class, 'sprintsList']);
Route::get('/lead-cycle-time', [DashboardController::class, 'leadCycleTime']);
Route::get('/compare-periods', [DashboardController::class, 'comparePeriods']);
Route::get('/anomalies', [DashboardController::class, 'anomalies']);
Route::get('/release-timeline', [DashboardController::class, 'releaseTimeline']);
Route::get('/month-over-month', [DashboardController::class, 'monthOverMonth']);

// Импорт
Route::post('/import/sprints', [ImportController::class, 'importSprints']);
Route::post('/import/releases', [ImportController::class, 'importReleases']);

// Monte Carlo
Route::get('/monte-carlo', [MonteCarloController::class, 'simulate']);

// Яндекс.Трекер
Route::post('/yandex-tracker/test', [YandexTrackerController::class, 'testConnection']);
Route::post('/yandex-tracker/fetch', [YandexTrackerController::class, 'fetchSprints']);

// Jira
Route::post('/jira/test', [JiraController::class, 'testConnection']);
Route::post('/jira/fetch', [JiraController::class, 'fetchSprints']);
