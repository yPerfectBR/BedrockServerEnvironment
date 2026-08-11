#!/bin/bash
# Executa as ferramentas de configuracao do ambiente.

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLS_DIR="$ROOT_DIR/script-tools"

if [ ! -d "$TOOLS_DIR/node_modules" ] && [ ! -f "$TOOLS_DIR/package-lock.json" ]; then
    echo "Dependencias do script-tools nao encontradas."
    echo "Execute ./install-all.sh antes de usar este configurador."
    exit 1
fi

npm run config --prefix "$TOOLS_DIR"
