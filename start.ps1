# Script de inicializacao para Windows PowerShell
# Inicia todos os servicos do projeto Bedrock Server

$ErrorActionPreference = "Stop"

Write-Host "Iniciando Bedrock Server Project..." -ForegroundColor Green

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Arquivo .env nao encontrado." -ForegroundColor Red
    Write-Host "Crie/revise o .env antes de iniciar os servicos." -ForegroundColor Yellow
    exit 1
}

function Invoke-Compose {
    param([string[]]$Arguments)

    docker compose version *> $null
    if ($LASTEXITCODE -eq 0) {
        docker compose @Arguments
        return $LASTEXITCODE
    }

    $dockerCompose = Get-Command "docker-compose" -ErrorAction SilentlyContinue
    if ($null -ne $dockerCompose) {
        docker-compose @Arguments
        return $LASTEXITCODE
    }

    Write-Host "Docker Compose nao foi encontrado. Rode .\install-all.ps1 ou instale Docker Compose." -ForegroundColor Red
    exit 1
}

function Get-EnvValue {
    param(
        [string]$Key,
        [string]$Fallback
    )

    $line = Get-Content ".env" | Where-Object { $_ -match "^$Key=" } | Select-Object -Last 1
    if ($line) {
        return ($line -split "=", 2)[1]
    }

    return $Fallback
}

Write-Host "Preparando addon..." -ForegroundColor Cyan
if (-not (Test-Path "development/node_modules")) {
    Write-Host "Dependencias de development/ nao encontradas." -ForegroundColor Red
    Write-Host "Execute .\install-all.ps1 antes de iniciar os servicos." -ForegroundColor Yellow
    exit 1
}

npm --prefix development run build
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

node script-tools/config/sync-addon.js
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
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
$composeExitCode = Invoke-Compose -Arguments @("up", "-d")
if ($composeExitCode -ne 0) {
    Write-Host ""
    Write-Host "Falha ao iniciar os servicos." -ForegroundColor Red
    Write-Host "Logs recentes:" -ForegroundColor Yellow
    Invoke-Compose -Arguments @("logs", "--tail=80")
    exit 1
}

Write-Host ""
Write-Host "Servicos iniciados!" -ForegroundColor Green
Write-Host ""
Write-Host "Status dos servicos:" -ForegroundColor Cyan
Invoke-Compose -Arguments @("ps")

Write-Host ""
Write-Host "Para ver os logs:" -ForegroundColor Yellow
Write-Host "   docker compose logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "Servidor Bedrock:" -ForegroundColor Yellow
Write-Host "   IP: localhost" -ForegroundColor Gray
$bedrockPort = Get-EnvValue -Key "BEDROCK_PORT_IPV4" -Fallback "19132"
Write-Host "   Porta: $bedrockPort (UDP)" -ForegroundColor Gray
Write-Host ""
Write-Host "API:" -ForegroundColor Yellow
$apiPort = Get-EnvValue -Key "API_PORT" -Fallback "3000"
Write-Host "   http://localhost:$apiPort" -ForegroundColor Gray
Write-Host "   Health: http://localhost:$apiPort/health" -ForegroundColor Gray
