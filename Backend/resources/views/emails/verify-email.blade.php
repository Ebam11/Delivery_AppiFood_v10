<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verifica tu correo electrónico - AppiFood</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            margin: 0;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            border: 1px solid #f1f5f9;
        }
        .logo {
            text-align: center;
            font-size: 28px;
            font-weight: 900;
            color: #ff4b3e;
            margin-bottom: 30px;
        }
        h1 {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 20px;
            text-align: center;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .btn-container {
            text-align: center;
            margin: 35px 0;
        }
        .btn {
            background-color: #ff4b3e;
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 36px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(255, 75, 62, 0.25);
            display: inline-block;
        }
        .footer {
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
            margin-top: 40px;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">AppiFood</div>
        <h1>¡Hola, {{ $user->name }}!</h1>
        <p>Gracias por unirte a AppiFood. Para comenzar a pedir comida deliciosa de tus restaurantes favoritos, necesitamos confirmar que esta dirección de correo te pertenece.</p>
        <div class="btn-container">
            <a href="{{ $verificationUrl }}" class="btn">Confirmar correo electrónico</a>
        </div>
        <p>Si tú no solicitaste esta cuenta, puedes ignorar este correo sin problemas.</p>
        <div class="footer">
            © {{ date('Y') }} AppiFood. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
