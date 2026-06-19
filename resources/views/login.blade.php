<!DOCTYPE html>
<html lang="ru" class="dark">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>Team Compass — Вход</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <link rel="alternate icon" href="{{ asset('favicon.ico') }}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #0a0a0f;
            color: #e0e0e0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-box {
            background: #11111f;
            border: 1px solid #1a1a2e;
            border-radius: 16px;
            padding: 40px 48px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .login-box h1 {
            font-size: 24px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #7c3aed, #4f46e5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .login-box .subtitle {
            text-align: center;
            color: #6b6b8b;
            font-size: 14px;
            margin-bottom: 32px;
        }
        .login-box label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #a0a0c0;
            margin-bottom: 6px;
        }
        .login-box input {
            width: 100%;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid #1a1a2e;
            background: #0a0a0f;
            color: #e0e0e0;
            font-size: 15px;
            outline: none;
            transition: border-color 0.2s;
        }
        .login-box input:focus {
            border-color: #7c3aed;
        }
        .login-box .error {
            color: #ef4444;
            font-size: 13px;
            margin-top: 6px;
        }
        .login-box button {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(135deg, #7c3aed, #4f46e5);
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.1s;
        }
        .login-box button:hover {
            opacity: 0.9;
        }
        .login-box button:active {
            transform: scale(0.98);
        }
        .login-box .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .login-box .logo img {
            height: 48px;
        }
        .login-box .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #4a4a6a;
        }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="logo">
            <img src="{{ asset('logo.svg') }}" alt="Team Compass" />
        </div>
        <h1>Team Compass</h1>
        <p class="subtitle">Delivery Analytics Dashboard</p>

        @if ($errors->any())
            <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); border-radius: 8px; padding: 10px; margin-bottom: 20px;">
                @foreach ($errors->all() as $error)
                    <p style="color: #ef4444; font-size: 13px; margin: 0;">{{ $error }}</p>
                @endforeach
            </div>
        @endif

        <form method="POST" action="{{ route('login.submit') }}">
            @csrf
            <div style="margin-bottom: 20px;">
                <label for="password">Введите пароль</label>
                <input type="password" id="password" name="password" placeholder="••••••••" autofocus />
            </div>
            <button type="submit">Войти</button>
        </form>

        <div class="footer">
            Team Compass v1.0
        </div>
    </div>
</body>
</html>
