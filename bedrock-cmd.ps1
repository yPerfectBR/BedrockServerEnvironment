# Script helper para executar comandos no servidor Bedrock
# Uso: .\bedrock-cmd.ps1 "list"
#      .\bedrock-cmd.ps1 "op yPerfectBR"

param(
    [Parameter(Mandatory=$true)]
    [string]$Command
)

if ([string]::IsNullOrWhiteSpace($Command)) {
    Write-Host "❌ Erro: Comando não pode ser vazio" -ForegroundColor Red
    Write-Host "Uso: .\bedrock-cmd.ps1 `<comando>`" -ForegroundColor Yellow
    Write-Host "Exemplo: .\bedrock-cmd.ps1 `"list`"" -ForegroundColor Yellow
    exit 1
}

Write-Host "📤 Enviando comando: $Command" -ForegroundColor Cyan

# Tentar método 1: Via echo e tee
$result = echo "$Command" | docker compose exec -T bedrock-server sh -c "cat > /proc/1/fd/0" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Método 1 falhou, tentando método alternativo..." -ForegroundColor Yellow
    
    # Método alternativo: Via docker exec
    $result = docker compose exec bedrock-server sh -c "echo '$Command' > /proc/1/fd/0" 2>&1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Comando enviado com sucesso!" -ForegroundColor Green
    Write-Host "📋 Verifique os logs para ver a resposta:" -ForegroundColor Cyan
    Write-Host "   docker compose logs --tail=20 bedrock-server" -ForegroundColor Gray
} else {
    Write-Host "❌ Erro ao enviar comando" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Dica: Use 'docker attach bedrock-server' para console interativo" -ForegroundColor Yellow
}

