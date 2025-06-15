# Create a 256x256 icon using PowerShell
Add-Type -AssemblyName System.Drawing

# Load the 128px icon
$sourceImage = [System.Drawing.Image]::FromFile(".\assets\icon128.png")

# Create a new 256x256 bitmap
$newImage = New-Object System.Drawing.Bitmap(256, 256)
$graphics = [System.Drawing.Graphics]::FromImage($newImage)

# Set high quality scaling
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Draw the scaled image
$graphics.DrawImage($sourceImage, 0, 0, 256, 256)

# Save the new image
$newImage.Save(".\assets\icon256.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup
$graphics.Dispose()
$newImage.Dispose()
$sourceImage.Dispose()

Write-Host "Created 256x256 icon successfully!"
