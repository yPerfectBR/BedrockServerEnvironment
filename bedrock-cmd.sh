#!/bin/bash
# Script helper para executar comandos no servidor Bedrock
# Uso: ./bedrock-cmd.sh "list"
#      ./bedrock-cmd.sh "op yPerfectBR"

if [ -z "$1" ]; then
    echo "❌ Erro: Comando não fornecido"
    echo "Uso: ./bedrock-cmd.sh <comando>"
    echo "Exemplo: ./bedrock-cmd.sh \"list\""
    exit 1
fi

COMMAND="$1"

echo "📤 Enviando comando: $COMMAND"

# Tentar enviar comando via stdin
echo "$COMMAND" | docker compose exec -T bedrock-server sh -c "cat > /proc/1/fd/0" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Comando enviado com sucesso!"
    echo "📋 Verifique os logs para ver a resposta:"
    echo "   docker compose logs --tail=20 bedrock-server"
else
    echo "❌ Erro ao enviar comando"
    echo ""
    echo "💡 Dica: Use 'docker attach bedrock-server' para console interativo"
    echo "   Para sair sem parar o servidor: Ctrl+P, depois Ctrl+Q"
fi

