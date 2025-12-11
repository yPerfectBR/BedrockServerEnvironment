# Script de inicializacao para Windows PowerShell
# Inicia todos os servicos do projeto Bedrock Server

Write-Host "Iniciando Bedrock Server Project..." -ForegroundColor Green

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Arquivo .env nao encontrado. Copiando .env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "Arquivo .env criado. Por favor, edite-o com suas configuracoes." -ForegroundColor Green
}

# Verificar se Docker esta rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "Docker nao esta rodando. Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# Iniciar servicos
Write-Host "Iniciando servicos Docker..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "Servicos iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "Status dos servicos:" -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Para ver os logs:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "Servidor Bedrock:" -ForegroundColor Yellow
Write-Host "   IP: localhost" -ForegroundColor Gray
Write-Host "   Porta: 19132 (UDP)" -ForegroundColor Gray
Write-Host ""
Write-Host "API:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host "   Health: http://localhost:3000/health" -ForegroundColor Gray
