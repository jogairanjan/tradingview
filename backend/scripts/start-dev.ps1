# Start backend with MySQL check
$envFile = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $PSScriptRoot "..\.env.example") $envFile
  Write-Host "Created .env from .env.example — edit DB_PASSWORD if MySQL login fails."
}

Set-Location (Join-Path $PSScriptRoot "..")
node src/server.js
