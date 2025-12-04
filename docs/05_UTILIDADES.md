# 🛠️ Utilidades

## Scripts Disponíveis

### Instalação

- `install-all.sh` / `install-all.ps1` - Instala todas as dependências do projeto

### Inicialização

- `start.sh` / `start.ps1` - Inicia todos os serviços Docker

### Console do Servidor

- `bedrock-cmd.sh` / `bedrock-cmd.ps1` - Envia comandos ao servidor Bedrock

**Uso:**
```bash
# Linux/Mac
./bedrock-cmd.sh "list"
./bedrock-cmd.sh "op yPerfectBR"

# Windows
.\bedrock-cmd.ps1 "list"
.\bedrock-cmd.ps1 "op yPerfectBR"
```

## Console Interativo

Para acessar o console interativo do servidor:

```bash
docker attach bedrock-server
```

**Importante:**
- Para sair sem parar o servidor: Pressione `Ctrl+P` seguido de `Ctrl+Q`
- **NÃO use `Ctrl+C`** - isso pararia o servidor!

## Ver Logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f bedrock-server
docker-compose logs -f api
docker-compose logs -f mongodb

# Últimas 100 linhas
docker-compose logs --tail=100 bedrock-server
```

## Backup

### Banco de Dados

```bash
# Criar backup
docker-compose exec mongodb mongodump --out /backup

# Restaurar backup
docker-compose exec mongodb mongorestore /backup
```

### Mundos

Faça backup da pasta `bedrockServer/worlds/` regularmente.

## Desenvolvimento

### API (Modo Watch)

Para desenvolvimento com hot-reload automático:

1. Configure `NODE_ENV=development` no `.env`
2. Reinicie o container: `docker compose restart api`
3. Edite arquivos em `server/src/` - mudanças são aplicadas automaticamente

Consulte [Guia de Desenvolvimento](08_DESENVOLVIMENTO.md) para mais detalhes.

### Addons (Modo Watch)

```bash
cd development
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass  # Apenas uma vez
npx just-scripts local-deploy --watch  # Compila e envia automaticamente
```

Qualquer mudança em `development/scripts/` será compilada e enviada automaticamente para o servidor.

## Troubleshooting

### Serviços não iniciam

1. Verifique se o Docker está rodando
2. Verifique se as portas estão disponíveis
3. Verifique os logs: `docker-compose logs`

### API não conecta ao MongoDB

1. Verifique se MongoDB está saudável: `docker-compose ps mongodb`
2. Verifique as credenciais no `.env`
3. Verifique os logs: `docker-compose logs mongodb`

### Porta já em uso

Altere a porta no arquivo `.env`:

```env
API_PORT=3001
BEDROCK_PORT_IPV4=19133
```

