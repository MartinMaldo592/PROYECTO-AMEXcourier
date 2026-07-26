Write-Host "Deteniendo el servidor Amex Courier ERP en el puerto 5000..." -ForegroundColor Yellow
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "Servidor detenido correctamente." -ForegroundColor Green
} else {
    Write-Host "No se encontró ningún servidor corriendo en el puerto 5000." -ForegroundColor Cyan
}
