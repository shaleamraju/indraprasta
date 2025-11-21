# Download original-site images into public/assets
# Run from project root (PowerShell):
#   cd d:\indraprasta\frontend
#   .\scripts\download_images.ps1

$assetsDir = Join-Path $PSScriptRoot "..\public\assets"
if (-not (Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir | Out-Null }

$images = @(
    @{ url = 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c992_a/image/upload/v1602743758/business/42d0c966-decc-4e3b-88be-be8c03306253/CLIQ4797-copyjpg.jpg' },
    @{ url = 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1551791787/category/shutterstock_548927521.jpg' },
    @{ url = 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1568110680/category/shutterstock_724503046.jpg' },
    @{ url = 'https://speedy.uenicdn.com/42d0c966-decc-4e3b-88be-be8c03306253/c360_a/image/upload/v1568029117/category/shutterstock_1262587624.jpg' }
)

foreach ($img in $images) {
    $uri = $img.url
    $name = [System.IO.Path]::GetFileName($uri)
    $out = Join-Path $assetsDir $name
    Write-Host "Downloading $uri -> $out"
    try {
        Invoke-WebRequest -Uri $uri -OutFile $out -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $uri : $_"
    }
}

Write-Host "Done. Images saved to public/assets/."