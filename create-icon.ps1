# PowerShell script to create a Windows .ico file from PNG files
# This will combine multiple PNG sizes into a single .ico file

$iconSizes = @(16, 48, 128)
$sourceDir = ".\assets"
$outputFile = ".\assets\icon.ico"

# Check if we have magick (ImageMagick) installed
try {
    $magickPath = Get-Command magick -ErrorAction Stop
    Write-Host "Found ImageMagick at: $($magickPath.Source)"
    
    # Create command to convert PNG files to ICO
    $pngFiles = @()
    foreach ($size in $iconSizes) {
        $pngFile = Join-Path $sourceDir "icon$size.png"
        if (Test-Path $pngFile) {
            $pngFiles += $pngFile
        }
    }
    
    if ($pngFiles.Count -gt 0) {
        $cmd = "magick " + ($pngFiles -join " ") + " `"$outputFile`""
        Write-Host "Running: $cmd"
        Invoke-Expression $cmd
        Write-Host "Created $outputFile successfully!"
    } else {
        Write-Host "No PNG files found to convert"
    }
} catch {
    Write-Host "ImageMagick not found. Using fallback method..."
    # Fallback: Just copy the 48px icon as the main icon
    $source48 = Join-Path $sourceDir "icon48.png"
    if (Test-Path $source48) {
        Copy-Item $source48 $outputFile -Force
        Write-Host "Copied icon48.png as icon.ico (fallback method)"
    }
}
