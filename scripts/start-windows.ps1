$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
docker build -t prelegal $root
docker run -d --name prelegal -p 8000:8000 --rm prelegal
Write-Host "Prelegal running at http://localhost:8000"
