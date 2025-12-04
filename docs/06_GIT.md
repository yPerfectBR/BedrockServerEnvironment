# 📦 Configuração Git

## Estrutura do Repositório

### ✅ Arquivos Commitados

- Código fonte (`server/src/`, `development/scripts/`)
- Configurações (`docker-compose.yml`, `*.json`, `*.ts`)
- Documentação (`docs/`, `README.md`)
- Scripts (`*.sh`, `*.ps1`)

### ❌ Arquivos Ignorados

- `node_modules/` - Dependências npm
- `dist/`, `build/` - Arquivos compilados
- `.env` - Variáveis de ambiente
- `bedrockServer/bedrock_server-*` - Binário do servidor
- `bedrockServer/worlds/` - Mundos dos jogadores
- `bedrockServer/behavior_packs/vanilla*` - Packs padrão (muito grandes)

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

- **NUNCA** commite o arquivo `.env` com credenciais reais
- O binário do servidor Bedrock é muito grande (211MB+) e será baixado automaticamente
- Os packs vanilla são ignorados pois são muito grandes e são baixados automaticamente
- Use `git add .` com cuidado - sempre verifique com `git status` antes

