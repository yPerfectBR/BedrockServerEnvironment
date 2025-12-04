#!/bin/bash
# Script para instalar todas as dependências do projeto
# Instala packages em todas as pastas que contêm package.json

echo "📦 Instalando dependências de todos os projetos..."
echo ""

# Contador de projetos
count=0

# Função para instalar em um diretório
install_packages() {
    local dir=$1
    if [ -f "$dir/package.json" ]; then
        echo "📦 Instalando em $dir..."
        cd "$dir" || exit 1
        npm install
        if [ $? -eq 0 ]; then
            echo "✅ $dir - Dependências instaladas com sucesso!"
            ((count++))
        else
            echo "❌ $dir - Erro ao instalar dependências"
        fi
        cd - > /dev/null || exit 1
        echo ""
    fi
}

# Instalar na raiz (se houver package.json)
if [ -f "package.json" ]; then
    install_packages "."
fi

# Instalar em server/
if [ -d "server" ]; then
    install_packages "server"
fi

# Instalar em development/
if [ -d "development" ]; then
    install_packages "development"
fi

echo "✅ Instalação concluída!"
echo "📊 Total de projetos processados: $count"
echo ""
echo "💡 Próximos passos:"
echo "   1. Configure o arquivo .env (copie de env.example)"
echo "   2. Execute ./start.sh para iniciar os serviços"

