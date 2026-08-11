# Script para preparar o ambiente e instalar todas as dependencias do projeto.

Write-Host "Preparando ambiente do Bedrock Server Project..." -ForegroundColor Cyan
Write-Host ""

$count = 0

function Test-Command {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Install-WithWinget {
    param(
        [string]$Id,
        [string]$Name
    )

    Write-Host "Instalando $Name com winget..." -ForegroundColor Yellow
    winget install --id $Id --exact --accept-package-agreements --accept-source-agreements
    return $LASTEXITCODE -eq 0
}

function Install-WithChocolatey {
    param(
        [string]$Package,
        [string]$Name
    )

    Write-Host "Instalando $Name com Chocolatey..." -ForegroundColor Yellow
    choco install $Package -y
    return $LASTEXITCODE -eq 0
}

function Ensure-Node {
    if ((Test-Command "node") -and (Test-Command "npm")) {
        Write-Host "Node.js e npm ja estao instalados." -ForegroundColor Green
        return
    }

    Write-Host "Node.js/npm nao encontrados. Instalando Node.js LTS..." -ForegroundColor Yellow

    $installed = $false
    if (Test-Command "winget") {
        $installed = Install-WithWinget -Id "OpenJS.NodeJS.LTS" -Name "Node.js LTS"
    } elseif (Test-Command "choco") {
        $installed = Install-WithChocolatey -Package "nodejs-lts" -Name "Node.js LTS"
    }

    if (-not $installed) {
        Write-Host "Nao foi possivel instalar Node.js automaticamente." -ForegroundColor Red
        Write-Host "Instale Node.js LTS manualmente e rode este script novamente." -ForegroundColor Yellow
        exit 1
    }

    if (-not ((Test-Command "node") -and (Test-Command "npm"))) {
        Write-Host "Node.js foi instalado, mas node/npm ainda nao estao no PATH desta sessao." -ForegroundColor Yellow
        Write-Host "Abra um novo PowerShell e rode este script novamente." -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Node.js instalado." -ForegroundColor Green
}

function Ensure-Docker {
    if (Test-Command "docker") {
        Write-Host "Docker ja esta instalado." -ForegroundColor Green
    } else {
        Write-Host "Docker nao encontrado. Instalando Docker Desktop..." -ForegroundColor Yellow

        $installed = $false
        if (Test-Command "winget") {
            $installed = Install-WithWinget -Id "Docker.DockerDesktop" -Name "Docker Desktop"
        } elseif (Test-Command "choco") {
            $installed = Install-WithChocolatey -Package "docker-desktop" -Name "Docker Desktop"
        }

        if (-not $installed) {
            Write-Host "Nao foi possivel instalar Docker automaticamente." -ForegroundColor Red
            Write-Host "Instale Docker Desktop manualmente e rode este script novamente." -ForegroundColor Yellow
            exit 1
        }

        Write-Host "Docker Desktop instalado." -ForegroundColor Green
    }

    if (Test-Command "docker") {
        docker compose version | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Docker Compose nao respondeu. Abra/inicie o Docker Desktop e rode novamente se necessario." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Abra um novo PowerShell para atualizar o PATH do Docker, depois rode este script novamente." -ForegroundColor Yellow
        exit 1
    }
}

function Install-Packages {
    param([string]$Dir)

    if (Test-Path "$Dir\package.json") {
        Write-Host "Instalando em $Dir..." -ForegroundColor Yellow
        Push-Location $Dir
        try {
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "$Dir - Dependencias instaladas com sucesso!" -ForegroundColor Green
                $script:count++
            } else {
                Write-Host "$Dir - Erro ao instalar dependencias" -ForegroundColor Red
                exit $LASTEXITCODE
            }
        } finally {
            Pop-Location
        }
        Write-Host ""
    }
}

Ensure-Node
Ensure-Docker

Write-Host ""
Write-Host "Instalando dependencias de todos os projetos..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "package.json") {
    Install-Packages "."
}

if (Test-Path "server") {
    Install-Packages "server"
}

if (Test-Path "development") {
    Install-Packages "development"
}

if (Test-Path "script-tools") {
    Install-Packages "script-tools"
}

Write-Host "Instalacao concluida!" -ForegroundColor Green
Write-Host "Total de projetos processados: $count" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "   1. Revise o arquivo .env se precisar mudar portas, mundo ou credenciais" -ForegroundColor Gray
Write-Host "   2. Execute .\configure.ps1 para ajustar mundo/addon" -ForegroundColor Gray
Write-Host "   3. Execute .\start.ps1 para iniciar os servicos" -ForegroundColor Gray
