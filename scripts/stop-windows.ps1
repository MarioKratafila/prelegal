docker stop prelegal 2>$null
if ($LASTEXITCODE -ne 0) { Write-Host "Container not running" }
