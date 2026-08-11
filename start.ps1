# Script de inicializacao para Windows PowerShell
# Inicia todos os servicos do projeto Bedrock Server

param(
    [switch]$StartDockerServiceOnly,
    [switch]$Elevated,
    [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"

if (-not $ProjectRoot) {
    if ($PSScriptRoot) {
        $ProjectRoot = $PSScriptRoot
    } else {
        $ProjectRoot = (Get-Location).Path
    }
}

Set-Location $ProjectRoot

Write-Host "Iniciando Bedrock Server Project..." -ForegroundColor Green
Write-Host "Diretorio do projeto: $ProjectRoot" -ForegroundColor DarkGray

# Verificar se o arquivo .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Arquivo .env nao encontrado." -ForegroundColor Red
    Write-Host "Crie/revise o .env antes de iniciar os servicos." -ForegroundColor Yellow
    exit 1
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Pause-IfElevated {
    if ($Elevated) {
        Write-Host ""
        Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
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

function Test-DockerRunning {
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        return $false
    }

    docker info *> $null
    return $LASTEXITCODE -eq 0
}

function Start-DockerDesktopApp {
    $programFilesX86 = [Environment]::GetFolderPath("ProgramFilesX86")
    $paths = @(
        "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe",
        "$programFilesX86\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
    )

    foreach ($path in $paths) {
        if ($path -and (Test-Path $path)) {
            Write-Host "Abrindo Docker Desktop..." -ForegroundColor Cyan
            Start-Process -FilePath $path | Out-Null
            return $true
        }
    }

    return $false
}

function Wait-DockerRunning {
    param([int]$TimeoutSeconds = 120)

    Write-Host "Aguardando Docker responder..." -ForegroundColor Cyan
    $spinner = @("|", "/", "-", "\")
    $index = 0
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        if (Test-DockerRunning) {
            Write-Host "`rDocker esta rodando.                         " -ForegroundColor Green
            return $true
        }

        Write-Host -NoNewline "`rDocker iniciando... $($spinner[$index % $spinner.Length])"
        Start-Sleep -Seconds 2
        $index++
    }

    Write-Host ""
    return $false
}

function Start-DockerServiceHere {
    $service = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue

    if ($null -ne $service -and $service.Status -ne "Running") {
        Write-Host "Iniciando servico com.docker.service..." -ForegroundColor Cyan
        Start-Service -Name "com.docker.service"
    }

    $openedDesktop = Start-DockerDesktopApp
    if (-not $openedDesktop -and $null -eq $service) {
        Write-Host "Docker Desktop nao foi encontrado no caminho padrao." -ForegroundColor Yellow
    }
}

function Start-DockerServiceElevated {
    $scriptPath = $PSCommandPath
    if (-not $scriptPath) {
        $scriptPath = $MyInvocation.MyCommand.Path
    }

    $argumentList = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$scriptPath`"",
        "-StartDockerServiceOnly",
        "-Elevated",
        "-ProjectRoot", "`"$ProjectRoot`""
    )

    Write-Host "Abrindo janela de Administrador para iniciar o Docker..." -ForegroundColor Yellow
    $process = Start-Process -FilePath "powershell.exe" -ArgumentList $argumentList -Verb RunAs -WorkingDirectory $ProjectRoot -PassThru
    Write-Host "Aguardando a janela elevada finalizar..." -ForegroundColor Cyan
    $process.WaitForExit()

    if ($process.ExitCode -ne 0) {
        Write-Host "A janela elevada terminou com erro ao iniciar Docker." -ForegroundColor Red
    }
}

function Ensure-DockerRunning {
    if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
        Write-Host "Docker nao foi encontrado." -ForegroundColor Red
        Write-Host "Execute .\install-all.ps1 para instalar o Docker Desktop." -ForegroundColor Yellow
        exit 1
    }

    if (Test-DockerRunning) {
        return
    }

    Write-Host "Docker nao esta rodando." -ForegroundColor Yellow
    $answer = Read-Host "Deseja tentar iniciar o Docker agora? [S/n]"

    if ($answer -and $answer.Trim().ToLower() -notin @("s", "sim", "y", "yes")) {
        Write-Host "Inicie o Docker Desktop manualmente e rode .\start.ps1 novamente." -ForegroundColor Yellow
        exit 1
    }

    $service = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
    $needsAdmin = ($null -ne $service -and $service.Status -ne "Running" -and -not (Test-IsAdmin))

    if ($needsAdmin) {
        Start-DockerServiceElevated
    } else {
        Start-DockerServiceHere
    }

    if (-not (Wait-DockerRunning -TimeoutSeconds 150)) {
        Write-Host "Docker nao respondeu a tempo." -ForegroundColor Red
        Write-Host "Abra o Docker Desktop, aguarde o status ficar Running e rode .\start.ps1 novamente." -ForegroundColor Yellow
        exit 1
    }
}

if ($StartDockerServiceOnly) {
    try {
        Start-DockerServiceHere
        if (-not (Wait-DockerRunning -TimeoutSeconds 150)) {
            exit 1
        }
    } finally {
        Pause-IfElevated
    }

    exit 0
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
Ensure-DockerRunning

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
