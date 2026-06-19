<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;

class DashboardLoginController extends Controller
{
    public function showLogin(): View
    {
        return view('login');
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $validPassword = env('DASHBOARD_PASSWORD', 'default_password');

        if ($request->password === $validPassword) {
            Session::put('dashboard_authenticated', true);
            return redirect()->route('home');
        }

        return back()->withErrors([
            'password' => 'Неверный пароль',
        ])->withInput();
    }

    public function logout(Request $request): RedirectResponse
    {
        Session::forget('dashboard_authenticated');
        return redirect()->route('login');
    }
}
