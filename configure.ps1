# Executa as ferramentas de configuracao do ambiente.

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ToolsDir = Join-Path $RootDir "script-tools"

if (
    -not (Test-Path (Join-Path $ToolsDir "node_modules")) -and
    -not (Test-Path (Join-Path $ToolsDir "package-lock.json"))
) {
    Write-Host "Dependencias do script-tools nao encontradas." -ForegroundColor Yellow
    Write-Host "Execute .\install-all.ps1 antes de usar este configurador." -ForegroundColor Yellow
    exit 1
}

npm run config --prefix $ToolsDir
