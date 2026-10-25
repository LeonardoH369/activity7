$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
$toolPath = Join-Path $projectPath 'tools/mailpit'
$exePath = Join-Path $toolPath 'mailpit.exe'
New-Item -ItemType Directory -Path $toolPath -Force | Out-Null
if (-not (Test-Path -LiteralPath $exePath)) {
    $release = Invoke-RestMethod 'https://api.github.com/repos/axllent/mailpit/releases/tags/v1.32.0'
    $asset = $release.assets | Where-Object name -EQ 'mailpit-windows-amd64.zip'
    if (-not $asset) { throw 'No se encontro el paquete oficial de Mailpit para Windows x64.' }
    if ($asset.digest -notmatch '^sha256:([a-fA-F0-9]{64})$') { throw 'No se pudo obtener el checksum oficial. No se instalara el ejecutable.' }
    $expectedHash = $Matches[1]
    $zipPath = Join-Path $toolPath 'mailpit.zip'
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zipPath
    if ((Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash -ne $expectedHash) { throw 'El checksum de Mailpit no coincide.' }
    Expand-Archive -LiteralPath $zipPath -DestinationPath $toolPath -Force
}
$dataPath = Join-Path $projectPath 'var'
New-Item -ItemType Directory -Path $dataPath -Force | Out-Null
Write-Host 'Buzon de PRUEBA LOCAL: http://localhost:8025. No envia a Internet. Ctrl+C para detener.'
& $exePath --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025 --database (Join-Path $dataPath 'mailpit.db')
