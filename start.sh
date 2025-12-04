#!/bin/bash
# Script de inicialização para Linux/Mac
# Inicia todos os serviços do projeto Bedrock Server

echo "🚀 Iniciando Bedrock Server Project..."

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado. Por favor, edite-o com suas configurações."
fi

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker."
    exit 1
fi

# Iniciar serviços
echo "📦 Iniciando serviços Docker..."
docker-compose up -d

echo ""
echo "✅ Serviços iniciados!"
echo ""
echo "📊 Status dos serviços:"
docker-compose ps

echo ""
echo "📝 Para ver os logs:"
echo "   docker-compose logs -f"
echo ""
echo "🎮 Servidor Bedrock:"
echo "   IP: localhost"
echo "   Porta: 19132 (UDP)"
echo ""
echo "🌐 API:"
echo "   http://localhost:3000"
echo "   Health: http://localhost:3000/health"

