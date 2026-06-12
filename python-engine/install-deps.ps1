# Install Python engine dependencies one package at a time (handles flaky networks).
$ErrorActionPreference = "Stop"
$Python = if ($args[0]) { $args[0] } else { "python" }

Write-Host "Using: $(& $Python --version 2>&1)" -ForegroundColor Cyan
& $Python -m pip install --upgrade pip

$packages = @(
    "flask>=3.0.0,<4",
    "python-dotenv>=1.0.0",
    "numpy>=1.26.0,<2.1.0",
    "pandas>=2.0.0,<2.3.0",
    "ta>=0.11.0",
    "ccxt>=4.0.0",
    "scikit-learn>=1.3.0,<1.7.0",
    "websocket-client>=1.6.0"
)

foreach ($pkg in $packages) {
    $attempt = 0
    $maxAttempts = 5
    while ($attempt -lt $maxAttempts) {
        $attempt++
        Write-Host "`n[$attempt/$maxAttempts] Installing $pkg ..." -ForegroundColor Yellow
        & $Python -m pip install --retries 10 --timeout 120 --no-cache-dir $pkg
        if ($LASTEXITCODE -eq 0) { break }
        if ($attempt -ge $maxAttempts) {
            Write-Host "Failed to install $pkg after $maxAttempts attempts." -ForegroundColor Red
            exit 1
        }
        Start-Sleep -Seconds 3
    }
}

Write-Host "`nAll packages installed. Test with: $Python app.py" -ForegroundColor Green
