<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Symfony\Component\HttpFoundation\Response;

class DashboardAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        // Если пользователь уже авторизован — пропускаем
        if (Session::has('dashboard_authenticated')) {
            return $next($request);
        }

        // Если запрос на страницу логина — пропускаем
        if ($request->routeIs('login') || $request->routeIs('login.submit')) {
            return $next($request);
        }

        // Иначе — редирект на логин
        return redirect()->route('login');
    }
}
