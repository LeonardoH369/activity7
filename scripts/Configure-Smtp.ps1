$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectPath '.env'
if (-not (Test-Path -LiteralPath $envPath)) {
    throw 'Primero copia .env.example a .env y configura la base de datos y SESSION_SECRET.'
}
$address = Read-Host 'Correo de la cuenta que enviara las notificaciones'
try { $parsed = [System.Net.Mail.MailAddress]::new($address) } catch { throw 'Correo no valido.' }
if ($parsed.Address -ne $address) { throw 'Introduce solo la direccion de correo.' }
$smtpHost = Read-Host 'Servidor SMTP (Enter para smtp.gmail.com)'
if ([string]::IsNullOrWhiteSpace($smtpHost)) { $smtpHost = 'smtp.gmail.com' }
$portInput = Read-Host 'Puerto SMTP: 465 o 587 (Enter para 465)'
if ([string]::IsNullOrWhiteSpace($portInput)) { $portInput = '465' }
if ($portInput -notin @('465','587')) { throw 'Usa 465 para TLS o 587 para STARTTLS.' }
$login = Read-Host 'Usuario SMTP (Enter para usar tu correo)'
if ([string]::IsNullOrWhiteSpace($login)) { $login = $address }
$secret = Read-Host 'Contrasena de aplicacion SMTP (no tu contrasena normal de Gmail)' -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    if ([string]::IsNullOrWhiteSpace($plain)) { throw 'La contrasena no puede estar vacia.' }
    $settings = [ordered]@{
        MAIL_MODE = 'smtp'
        MAIL_FROM = "Activity 9 <$address>"
        SMTP_HOST = $smtpHost
        SMTP_PORT = $portInput
        SMTP_SECURE = $(if ($portInput -eq '465') { 'true' } else { 'false' })
        SMTP_USER = $login
        SMTP_PASSWORD = $plain
    }
    $content = [IO.File]::ReadAllText($envPath)
    foreach ($key in $settings.Keys) {
        $value = [string]$settings[$key]
        if ($value -match '[\r\n]') { throw 'No se permiten saltos de linea en la configuracion.' }
        # Single-quoted dotenv values preserve #, $, quotes and backslashes literally.
        if ($value.Contains("'")) { throw 'Esta herramienta no admite comillas simples. Configura ese valor manualmente en .env.' }
        $line = $key + "='" + $value + "'"
        $pattern = '(?m)^' + [regex]::Escape($key) + '=.*$'
        if ([regex]::IsMatch($content,$pattern)) {
            $replacement = $line
            $content = [regex]::Replace($content,$pattern,[System.Text.RegularExpressions.MatchEvaluator]{ param($match) $replacement })
        } else { $content += "`n" + $line }
    }
    [IO.File]::WriteAllText($envPath,$content,[Text.UTF8Encoding]::new($false))
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    $plain = $null
    $settings = $null
    $content = $null
}
Write-Host 'Configuracion guardada en .env (excluido de Git). Verificando SMTP...'
Push-Location $projectPath
try { npm run mail:verify } finally { Pop-Location }
Write-Host 'Reinicia la app. Registra una cuenta con un buzon que controles y despues prueba cerrar e iniciar sesion.'
