$ErrorActionPreference = "Stop"
$sourcePath = "d:\Aether Flow"
$destinationPath = "d:\Aether Flow\aetherflow_submission.zip"

Write-Host "Cleaning up previous zip if exists..."
if (Test-Path $destinationPath) {
    Remove-Item $destinationPath -Force
}

Write-Host "Creating a temporary staging directory..."
$tempDir = Join-Path $env:TEMP "AetherFlowSubmission"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Copying files to staging directory..."
# Copy everything except node_modules, __pycache__, .git, and .venv
$exclude = @("node_modules", "__pycache__", ".git", ".venv", ".pytest_cache", "aetherflow_submission.zip")

Get-ChildItem -Path $sourcePath -Exclude $exclude -Recurse | Where-Object { 
    $path = $_.FullName
    $skip = $false
    foreach ($ex in $exclude) {
        if ($path -match "\\$ex\\") {
            $skip = $true
            break
        }
    }
    if (-not $skip) {
        $relativePath = $_.FullName.Substring($sourcePath.Length).TrimStart('\', '/')
        $dest = Join-Path $tempDir $relativePath
        if ($_.PSIsContainer) {
            if (-not (Test-Path $dest)) {
                New-Item -ItemType Directory -Path $dest | Out-Null
            }
        } else {
            $parent = Split-Path $dest
            if (-not (Test-Path $parent)) {
                New-Item -ItemType Directory -Path $parent | Out-Null
            }
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
    }
}

Write-Host "Compressing to $destinationPath..."
Compress-Archive -Path "$tempDir\*" -DestinationPath $destinationPath -Force

Write-Host "Cleaning up temporary directory..."
Remove-Item $tempDir -Recurse -Force

Write-Host "Successfully created submission package: $destinationPath"
