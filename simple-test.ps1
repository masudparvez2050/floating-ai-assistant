Write-Host "Floating AI Assistant - Test Suite" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test required files
Write-Host "`nChecking required files..." -ForegroundColor Yellow

$files = @(
    "src\main.js",
    "src\preload.js", 
    "src\index.html",
    "src\ai-service.js",
    "package.json",
    "README.md"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "OK: $file" -ForegroundColor Green
    }
    else {
        Write-Host "MISSING: $file" -ForegroundColor Red
    }
}

# Check dependencies
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "OK: node_modules installed" -ForegroundColor Green
}
else {
    Write-Host "MISSING: node_modules (run npm install)" -ForegroundColor Red
}

# Check build output
Write-Host "`nChecking build output..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $distFiles = Get-ChildItem "dist" -Name
    Write-Host "OK: Build directory exists with $($distFiles.Count) items" -ForegroundColor Green
}
else {
    Write-Host "MISSING: Build output (run npm run build)" -ForegroundColor Yellow
}

# Check package.json
Write-Host "`nChecking package.json..." -ForegroundColor Yellow
try {
    $package = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "OK: Package name: $($package.name)" -ForegroundColor Green
    Write-Host "OK: Package version: $($package.version)" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Cannot read package.json" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Cyan
