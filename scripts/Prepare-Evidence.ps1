$ErrorActionPreference = 'Stop'
$projectPath = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectPath
$configPath = (Resolve-Path "$projectPath\..\mysql-activity6\my.ini").Path
Start-Process 'C:\xampp\mysql\bin\mysqld.exe' -ArgumentList "--defaults-file=`"$configPath`"",'--bind-address=127.0.0.1','--console' -WorkingDirectory $projectPath -WindowStyle Hidden
Start-Process "$projectPath\tools\mailpit\mailpit.exe" -ArgumentList '--listen','127.0.0.1:8025','--smtp','127.0.0.1:1025','--database','var/mailpit.db' -WorkingDirectory $projectPath -WindowStyle Hidden
Start-Sleep -Seconds 5
Start-Process 'node' -ArgumentList 'src/server.js' -WorkingDirectory $projectPath -WindowStyle Hidden
Start-Sleep -Seconds 5
& node scripts/capture-evidence.js
if ($LASTEXITCODE -ne 0) { throw 'No se completaron las capturas.' }
