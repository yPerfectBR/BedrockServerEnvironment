# Script para preparar o ambiente e instalar todas as dependencias do projeto.

param(
    [switch]$Elevated
)

Write-Host "Preparando ambiente do Bedrock Server Project..." -ForegroundColor Cyan
Write-Host ""

$count = 0

function Pause-IfElevated {
    if ($Elevated) {
        Write-Host ""
        Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}

function Stop-Installer {
    param([int]$Code = 0)

    Pause-IfElevated
    exit $Code
}

trap {
    Write-Host ""
    Write-Host "Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    Stop-Installer 1
}

function Test-Command {
    param([string]$Name)
    return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Request-Elevation {
    param([string]$Reason)

    if (Test-IsAdmin) {
        return
    }

    Write-Host ""
    Write-Host $Reason -ForegroundColor Yellow
    Write-Host "Para evitar travas ou instalacao incompleta, o instalador sera reaberto como Administrador." -ForegroundColor Yellow
    $answer = Read-Host "Deseja continuar e abrir a janela de permissao do Windows? [S/n]"

    if ($answer -and $answer.Trim().ToLower() -notin @("s", "sim", "y", "yes")) {
        Write-Host "Instalacao interrompida. Abra o PowerShell como Administrador e rode .\install-all.ps1 novamente." -ForegroundColor Yellow
        Stop-Installer 1
    }

    $scriptPath = $PSCommandPath
    if (-not $scriptPath) {
        $scriptPath = $MyInvocation.MyCommand.Path
    }

    $argumentList = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$scriptPath`"",
        "-Elevated"
    )

    Write-Host "A nova janela elevada continuara o instalador completo, incluindo pacotes npm." -ForegroundColor Yellow

    try {
        Start-Process -FilePath "powershell.exe" -ArgumentList $argumentList -Verb RunAs
        exit 0
    } catch {
        Write-Host "Permissao de Administrador cancelada ou bloqueada." -ForegroundColor Red
        Write-Host "Abra o PowerShell como Administrador e rode .\install-all.ps1 novamente." -ForegroundColor Yellow
        Stop-Installer 1
    }
}

function Invoke-InstallCommand {
    param(
        [string]$FilePath,
        [string[]]$Arguments,
        [string]$Name
    )

    Write-Host "Isso pode levar alguns minutos. Se o Windows pedir permissao, aceite para continuar." -ForegroundColor DarkYellow

    $process = Start-Process -FilePath $FilePath -ArgumentList $Arguments -NoNewWindow -PassThru
    $spinner = @("|", "/", "-", "\")
    $index = 0

    while (-not $process.HasExited) {
        Write-Host -NoNewline "`r$Name em andamento... $($spinner[$index % $spinner.Length])"
        Start-Sleep -Seconds 2
        $index++
    }

    Write-Host "`r$Name finalizado.                      "
    return $process.ExitCode -eq 0
}

function Install-WithWinget {
    param(
        [string]$Id,
        [string]$Name
    )

    Write-Host "Instalando $Name com winget..." -ForegroundColor Yellow
    return Invoke-InstallCommand `
        -FilePath "winget" `
        -Arguments @("install", "--id", $Id, "--exact", "--accept-package-agreements", "--accept-source-agreements") `
        -Name $Name
}

function Install-WithChocolatey {
    param(
        [string]$Package,
        [string]$Name
    )

    Write-Host "Instalando $Name com Chocolatey..." -ForegroundColor Yellow
    return Invoke-InstallCommand `
        -FilePath "choco" `
        -Arguments @("install", $Package, "-y") `
        -Name $Name
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
        Stop-Installer 1
    }

    if (-not ((Test-Command "node") -and (Test-Command "npm"))) {
        Write-Host "Node.js foi instalado, mas node/npm ainda nao estao no PATH desta sessao." -ForegroundColor Yellow
        Write-Host "Abra um novo PowerShell e rode este script novamente." -ForegroundColor Yellow
        Stop-Installer 1
    }

    Write-Host "Node.js instalado." -ForegroundColor Green
}

function Ensure-Docker {
    if (Test-Command "docker") {
        Write-Host "Docker ja esta instalado." -ForegroundColor Green
    } else {
        Write-Host "Docker nao encontrado. Instalando Docker Desktop..." -ForegroundColor Yellow
        Request-Elevation "Docker Desktop normalmente precisa de permissao de Administrador para instalar servicos, WSL/Hyper-V e integracao de rede."

        $installed = $false
        if (Test-Command "winget") {
            $installed = Install-WithWinget -Id "Docker.DockerDesktop" -Name "Docker Desktop"
        } elseif (Test-Command "choco") {
            $installed = Install-WithChocolatey -Package "docker-desktop" -Name "Docker Desktop"
        }

        if (-not $installed) {
            Write-Host "Nao foi possivel instalar Docker automaticamente." -ForegroundColor Red
            Write-Host "Instale Docker Desktop manualmente e rode este script novamente." -ForegroundColor Yellow
            Stop-Installer 1
        }

        Write-Host "Docker Desktop instalado." -ForegroundColor Green
        Write-Host "Este script nao configura Docker Desktop para iniciar automaticamente com o Windows." -ForegroundColor Yellow
        Write-Host "Se essa foi a primeira instalacao do Docker Desktop, abra o Docker Desktop pelo menu iniciar e aguarde ele terminar a configuracao inicial." -ForegroundColor Yellow
        Write-Host "Pode ser necessario reiniciar o computador ou abrir um novo PowerShell para atualizar o PATH." -ForegroundColor Yellow
    }

    if (Test-Command "docker") {
        docker compose version | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Docker Compose nao respondeu." -ForegroundColor Yellow
            Write-Host "Abra/inicie o Docker Desktop, aguarde o status ficar Running e rode este script novamente se necessario." -ForegroundColor Yellow
        }
    } else {
        Write-Host "Abra um novo PowerShell para atualizar o PATH do Docker, depois rode este script novamente." -ForegroundColor Yellow
        Stop-Installer 1
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
                Stop-Installer $LASTEXITCODE
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

Pause-IfElevated
