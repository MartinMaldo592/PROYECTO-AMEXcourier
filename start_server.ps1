# =============================================================================
# start_server.ps1 - Script de inicio para AMEX Courier ERP (MiniERP)
# =============================================================================
# Requiere: .NET 8 SDK instalado  (https://dotnet.microsoft.com/download)
# Uso: Ejecutar desde la raíz del repositorio en PowerShell como Administrador
# =============================================================================

# Asegurar que dotnet esté en el PATH
if (!(Get-Command dotnet -ErrorAction SilentlyContinue)) {
    $localDotnet = "$env:USERPROFILE\AppData\Local\Microsoft\dotnet"
    if (Test-Path "$localDotnet\dotnet.exe") {
        $env:PATH = "$localDotnet;" + $env:PATH
    }
}

$env:ASPNETCORE_URLS = "http://localhost:5000"
$env:ASPNETCORE_ENVIRONMENT = "Development"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  AMEX Courier ERP - Iniciando servidor...  " -ForegroundColor Green
Write-Host "  URL: http://localhost:5000               " -ForegroundColor Yellow
Write-Host "  Swagger: http://localhost:5000/swagger   " -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

dotnet run --project "src\MiniERP.API\MiniERP.API.csproj" -c Debug
