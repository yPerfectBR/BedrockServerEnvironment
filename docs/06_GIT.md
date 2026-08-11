# 📦 Configuração Git

[Voltar ao índice](00_INDICE.md)

## Estrutura do Repositório

### ✅ Arquivos Commitados

- Código fonte (`server/src/`, `development/scripts/`)
- Configurações (`docker-compose.yml`, `*.json`, `*.ts`)
- Documentação (`docs/`, `README.md`)
- Scripts (`*.sh`, `*.ps1`)
- Ferramentas de configuração (`script-tools/`)
- Arquivo `.env` base do ambiente local

### ❌ Arquivos Ignorados

- `node_modules/` - Dependências npm
- `dist/`, `build/` - Arquivos compilados
- `.env.local`, `.env.*.local` - Sobrescritas locais, quando usadas
- `bedrockServer/bedrock_server-*` - Binário do servidor
- mundos grandes ou temporários em `bedrockServer/worlds/`
- packs gerados em `bedrockServer/development_behavior_packs/` e `bedrockServer/development_resource_packs/`
- packs vanilla ou gerados grandes, quando existirem

## Comandos Úteis

```bash
# Verificar o que será commitado
git status

# Ver arquivos ignorados
git status --ignored

# Adicionar arquivo específico mesmo estando no .gitignore
git add -f arquivo.txt
```

## ⚠️ Importante

- A `.env` base pode ficar versionada neste ambiente para facilitar setup local
- Antes de publicar em um GitHub real, coloque `.env` no `.gitignore` se houver qualquer credencial, token, senha ou valor privado
- O binário do servidor Bedrock é muito grande (211MB+) e será baixado automaticamente
- Os packs vanilla são ignorados pois são muito grandes e são baixados automaticamente
- Use `git add .` com cuidado - sempre verifique com `git status` antes
