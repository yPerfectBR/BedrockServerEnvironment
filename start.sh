#!/bin/bash
# Script de inicialização para Linux/Mac
# Inicia todos os serviços do projeto Bedrock Server

set -euo pipefail

echo "🚀 Iniciando Bedrock Server Project..."

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "❌ Arquivo .env não encontrado."
    echo "   Crie/revise o .env antes de iniciar os serviços."
    exit 1
fi

if docker compose version > /dev/null 2>&1; then
    compose_cmd=(docker compose)
elif command -v docker-compose > /dev/null 2>&1; then
    compose_cmd=(docker-compose)
else
    echo "❌ Docker Compose não foi encontrado. Rode ./install-all.sh ou instale Docker Compose."
    exit 1
fi

get_env_value() {
    local key="$1"
    local fallback="$2"
    local value

    value=$(grep -E "^${key}=" .env | tail -n 1 | cut -d '=' -f 2- || true)
    if [ -n "$value" ]; then
        printf '%s' "$value"
    else
        printf '%s' "$fallback"
    fi
}

echo "🧩 Preparando addon..."
if [ ! -d "development/node_modules" ]; then
    echo "❌ Dependências de development/ não encontradas."
    echo "   Execute ./install-all.sh antes de iniciar os serviços."
    exit 1
fi

npm --prefix development run build
node script-tools/config/sync-addon.js

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker."
    exit 1
fi

# Iniciar serviços
echo "📦 Iniciando serviços Docker..."
if ! "${compose_cmd[@]}" up -d; then
    echo ""
    echo "❌ Falha ao iniciar os serviços."
    echo "📝 Logs recentes:"
    "${compose_cmd[@]}" logs --tail=80
    exit 1
fi

echo ""
echo "✅ Serviços iniciados!"
echo ""
echo "📊 Status dos serviços:"
"${compose_cmd[@]}" ps

echo ""
echo "📝 Para ver os logs:"
echo "   ${compose_cmd[*]} logs -f"
echo ""
echo "🎮 Servidor Bedrock:"
echo "   IP: localhost"
echo "   Porta: $(get_env_value BEDROCK_PORT_IPV4 19132) (UDP)"
echo ""
echo "🌐 API:"
api_port="$(get_env_value API_PORT 3000)"
echo "   http://localhost:${api_port}"
echo "   Health: http://localhost:${api_port}/health"
