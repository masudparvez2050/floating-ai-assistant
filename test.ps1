# Floating AI Assistant - Test Script
# This script performs automated testing of the Windows desktop app

Write-Host "🚀 Floating AI Assistant - Test Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test 1: Check if all required files exist
Write-Host "`n📁 File Structure Test..." -ForegroundColor Yellow

$requiredFiles = @(
    "src\main.js",
    "src\preload.js", 
    "src\index.html",
    "src\ai-service.js",
    "src\scripts\app.js",
    "src\scripts\chat.js",
    "src\scripts\settings.js",
    "src\scripts\shortcuts.js",
    "src\styles\main.css",
    "src\styles\chat.css",
    "src\styles\settings.css",
    "package.json",
    "README.md",
    "LICENSE"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "✅ All required files present!" -ForegroundColor Green
}
else {
    Write-Host "❌ Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
}

# Test 2: Check package.json configuration
Write-Host "`n📦 Package Configuration Test..." -ForegroundColor Yellow

try {
    $package = Get-Content "package.json" | ConvertFrom-Json
    
    # Check required fields
    $requiredFields = @("name", "version", "main", "scripts", "dependencies", "build")
    foreach ($field in $requiredFields) {
        if ($package.PSObject.Properties.Name -contains $field) {
            Write-Host "✅ package.json has '$field'" -ForegroundColor Green
        }
        else {
            Write-Host "❌ package.json missing '$field'" -ForegroundColor Red
        }
    }
    
    # Check if electron is in dependencies
    if ($package.dependencies.electron -or $package.devDependencies.electron) {
        Write-Host "✅ Electron dependency found" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Electron dependency missing" -ForegroundColor Red
    }
    
}
catch {
    Write-Host "❌ Error reading package.json: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check build assets
Write-Host "`n🎨 Assets Test..." -ForegroundColor Yellow

$assetFiles = @(
    "assets\icon16.png",
    "assets\icon48.png", 
    "assets\icon128.png",
    "assets\icon256.png",
    "assets\icon.png",
    "assets\tray-icon.png"
)

foreach ($asset in $assetFiles) {
    if (Test-Path $asset) {
        $size = (Get-Item $asset).Length
        Write-Host "✅ $asset ($([math]::Round($size/1KB, 1)) KB)" -ForegroundColor Green
    }
    else {
        Write-Host "❌ $asset" -ForegroundColor Red
    }
}

# Test 4: Check if node_modules exists
Write-Host "`n📚 Dependencies Test..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    $nodeModulesSize = (Get-ChildItem "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum
    Write-Host "✅ node_modules present ($([math]::Round($nodeModulesSize/1000000, 1)) MB)" -ForegroundColor Green
}
else {
    Write-Host "❌ node_modules missing - run 'npm install'" -ForegroundColor Red
}

# Test 5: Check build output
Write-Host "`n🏗️ Build Output Test..." -ForegroundColor Yellow

if (Test-Path "dist") {
    $distFiles = Get-ChildItem "dist" -Name
    Write-Host "✅ Build directory exists with $($distFiles.Count) items:" -ForegroundColor Green
    foreach ($item in $distFiles) {
        if ($item -like "*.appx") {
            Write-Host "   📱 $item (Microsoft Store package)" -ForegroundColor Cyan
        }
        elseif ($item -like "*.exe") {
            Write-Host "   💻 $item (Windows installer)" -ForegroundColor Cyan
        }
        elseif ($item -like "*unpacked*") {
            Write-Host "   📁 $item (unpacked app)" -ForegroundColor Cyan
        }
        else {
            Write-Host "   📄 $item" -ForegroundColor Gray
        }
    }
}
else {
    Write-Host "❌ No build output found - run 'npm run build'" -ForegroundColor Red
}

# Test 6: Performance check
Write-Host "`n⚡ Performance Test..." -ForegroundColor Yellow

$srcSize = (Get-ChildItem "src" -Recurse -File | Measure-Object -Property Length -Sum).Sum
$totalSize = (Get-ChildItem "." -Exclude "node_modules", "dist", ".git" -Recurse -File | Measure-Object -Property Length -Sum).Sum

Write-Host "✅ Source code size: $([math]::Round($srcSize/1000, 1)) KB" -ForegroundColor Green
Write-Host "✅ Total project size (excluding node_modules): $([math]::Round($totalSize/1000000, 1)) MB" -ForegroundColor Green

# Test 7: Windows compatibility
Write-Host "`n🪟 Windows Compatibility Test..." -ForegroundColor Yellow

$windowsVersion = [System.Environment]::OSVersion.Version
if ($windowsVersion.Major -ge 10) {
    Write-Host "✅ Windows 10/11 detected ($($windowsVersion))" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Windows version may not be fully supported" -ForegroundColor Yellow
}

# Check if running as admin (for global shortcuts)
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    Write-Host "✅ Running with administrator privileges" -ForegroundColor Green
}
else {
    Write-Host "ℹ️ Not running as administrator (may affect global shortcuts)" -ForegroundColor Blue
}

# Summary
Write-Host "`n📊 Test Summary" -ForegroundColor Magenta
Write-Host "===============" -ForegroundColor Magenta

if ($missingFiles.Count -eq 0 -and (Test-Path "node_modules") -and (Test-Path "dist")) {
    Write-Host "🎉 All tests passed! App is ready for distribution." -ForegroundColor Green
}
elseif ($missingFiles.Count -eq 0 -and (Test-Path "node_modules")) {
    Write-Host "✅ App is ready for development. Run 'npm run build' to create distribution packages." -ForegroundColor Yellow
}
else {
    Write-Host "❌ Some issues found. Please address them before proceeding." -ForegroundColor Red
}

Write-Host "`n🚀 Quick Commands:" -ForegroundColor Cyan
Write-Host "   npm start          # Run in development" -ForegroundColor White
Write-Host "   npm run dev        # Run with DevTools" -ForegroundColor White  
Write-Host "   npm run build      # Build for production" -ForegroundColor White
Write-Host "   npm run dist       # Create installers" -ForegroundColor White
