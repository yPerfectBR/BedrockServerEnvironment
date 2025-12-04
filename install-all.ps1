# Script para instalar todas as dependências do projeto
# Instala packages em todas as pastas que contêm package.json

Write-Host "📦 Instalando dependências de todos os projetos..." -ForegroundColor Cyan
Write-Host ""

# Contador de projetos
$count = 0

# Função para instalar em um diretório
function Install-Packages {
    param(
        [string]$Dir
    )
    
    if (Test-Path "$Dir\package.json") {
        Write-Host "📦 Instalando em $Dir..." -ForegroundColor Yellow
        Push-Location $Dir
        try {
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $Dir - Dependências instaladas com sucesso!" -ForegroundColor Green
                $script:count++
            } else {
                Write-Host "❌ $Dir - Erro ao instalar dependências" -ForegroundColor Red
            }
        } finally {
            Pop-Location
        }
        Write-Host ""
    }
}

# Instalar na raiz (se houver package.json)
if (Test-Path "package.json") {
    Install-Packages "."
}

# Instalar em server/
if (Test-Path "server") {
    Install-Packages "server"
}

# Instalar em development/
if (Test-Path "development") {
    Install-Packages "development"
}

Write-Host "✅ Instalação concluída!" -ForegroundColor Green
Write-Host "📊 Total de projetos processados: $count" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Configure o arquivo .env (copie de env.example)" -ForegroundColor Gray
Write-Host "   2. Execute .\start.ps1 para iniciar os serviços" -ForegroundColor Gray

