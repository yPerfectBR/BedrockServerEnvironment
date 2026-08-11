#!/bin/bash
# Script para preparar o ambiente e instalar todas as dependências do projeto.

set -e

echo "📦 Preparando ambiente do Bedrock Server Project..."
echo ""

count=0

command_exists() {
    command -v "$1" > /dev/null 2>&1
}

run_as_root() {
    if [ "$(id -u)" -eq 0 ]; then
        "$@"
    elif command_exists sudo; then
        sudo "$@"
    else
        echo "❌ Este comando precisa de permissões de administrador e o sudo não foi encontrado: $*"
        exit 1
    fi
}

detect_linux_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "${ID:-unknown}"
    else
        echo "unknown"
    fi
}

install_node_linux() {
    if command_exists node && command_exists npm; then
        echo "✅ Node.js e npm já estão instalados."
        return
    fi

    echo "📦 Node.js/npm não encontrados. Instalando..."

    case "$(detect_linux_distro)" in
        ubuntu|debian|linuxmint|pop|elementary)
            run_as_root apt-get update
            run_as_root apt-get install -y nodejs npm
            ;;
        fedora)
            run_as_root dnf install -y nodejs npm
            ;;
        arch|manjaro|endeavouros)
            run_as_root pacman -Sy --needed --noconfirm nodejs npm
            ;;
        *)
            if command_exists apt-get; then
                run_as_root apt-get update
                run_as_root apt-get install -y nodejs npm
            elif command_exists dnf; then
                run_as_root dnf install -y nodejs npm
            elif command_exists pacman; then
                run_as_root pacman -Sy --needed --noconfirm nodejs npm
            else
                echo "❌ Não encontrei apt, dnf ou pacman para instalar Node.js/npm."
                echo "   Instale Node.js LTS e npm manualmente e rode este script novamente."
                exit 1
            fi
            ;;
    esac

    if ! command_exists node || ! command_exists npm; then
        echo "❌ Node.js/npm foram instalados, mas ainda não estão disponíveis no PATH."
        echo "   Abra um novo terminal ou instale Node.js LTS manualmente e rode novamente."
        exit 1
    fi

    echo "✅ Node.js/npm instalados."
}

install_docker_linux() {
    if command_exists docker; then
        echo "✅ Docker já está instalado."
    else
        echo "🐳 Docker não encontrado. Instalando..."

        case "$(detect_linux_distro)" in
            ubuntu|debian|linuxmint|pop|elementary)
                run_as_root apt-get update
                run_as_root apt-get install -y docker.io docker-compose-plugin
                ;;
            fedora)
                run_as_root dnf install -y docker docker-compose-plugin
                ;;
            arch|manjaro|endeavouros)
                run_as_root pacman -Sy --needed --noconfirm docker docker-compose
                ;;
            *)
                if command_exists apt-get; then
                    run_as_root apt-get update
                    run_as_root apt-get install -y docker.io docker-compose-plugin
                elif command_exists dnf; then
                    run_as_root dnf install -y docker docker-compose-plugin
                elif command_exists pacman; then
                    run_as_root pacman -Sy --needed --noconfirm docker docker-compose
                else
                    echo "❌ Não encontrei apt, dnf ou pacman para instalar Docker."
                    echo "   Instale Docker manualmente e rode este script novamente."
                    exit 1
                fi
                ;;
        esac

        echo "✅ Docker instalado."
    fi

    if ! command_exists docker; then
        echo "❌ Docker foi instalado, mas ainda não está disponível no PATH."
        echo "   Abra um novo terminal ou instale Docker manualmente e rode novamente."
        exit 1
    fi

    if ! docker compose version > /dev/null 2>&1 && ! command_exists docker-compose; then
        echo "❌ Docker Compose não foi encontrado após a instalação."
        echo "   Instale o plugin docker compose ou docker-compose e rode novamente."
        exit 1
    fi

    if command_exists systemctl; then
        echo "ℹ️  Iniciando Docker para esta sessão, sem habilitar inicialização automática com o sistema."
        run_as_root systemctl start docker > /dev/null 2>&1 || true
    fi

    if command_exists docker && ! docker info > /dev/null 2>&1; then
        echo "⚠️  Docker está instalado, mas o daemon não respondeu agora."
        echo "   Se estiver em WSL ou ambiente sem systemd, inicie o Docker manualmente."
    fi

    if command_exists getent && getent group docker > /dev/null 2>&1; then
        if ! id -nG "$USER" | tr ' ' '\n' | grep -qx docker; then
            echo "ℹ️  Adicionando usuário atual ao grupo docker para uso sem sudo..."
            run_as_root usermod -aG docker "$USER" || true
            echo "   Faça logout/login ou rode 'newgrp docker' para aplicar essa permissão."
        fi
    fi
}

install_packages() {
    local dir=$1
    if [ -f "$dir/package.json" ]; then
        echo "📦 Instalando em $dir..."
        (
            cd "$dir"
            npm install
        )
        echo "✅ $dir - Dependências instaladas com sucesso!"
        count=$((count + 1))
        echo ""
    fi
}

install_node_linux
install_docker_linux

echo ""
echo "📦 Instalando dependências de todos os projetos..."
echo ""

if [ -f "package.json" ]; then
    install_packages "."
fi

if [ -d "server" ]; then
    install_packages "server"
fi

if [ -d "development" ]; then
    install_packages "development"
fi

if [ -d "script-tools" ]; then
    install_packages "script-tools"
fi

echo "✅ Instalação concluída!"
echo "📊 Total de projetos processados: $count"
echo ""
echo "💡 Próximos passos:"
echo "   1. Revise o arquivo .env se precisar mudar portas, mundo ou credenciais"
echo "   2. Execute ./configure.sh para ajustar mundo/addon"
echo "   3. Execute ./start.sh para iniciar os serviços"
