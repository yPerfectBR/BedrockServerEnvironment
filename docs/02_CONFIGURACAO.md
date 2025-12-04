# ⚙️ Configuração

## Variáveis de Ambiente

Todas as configurações são feitas através do arquivo `.env`. Copie `env.example` para `.env` e edite conforme necessário.

### MongoDB

```env
MONGODB_USERNAME=admin
MONGODB_PASSWORD=admin123
MONGODB_DATABASE=bedrock_db
MONGODB_PORT=27017
```

### API

```env
NODE_ENV=production
# NODE_ENV=development  # Use 'development' para habilitar hot-reload (watch mode)
API_PORT=3000
```

**Nota:** Em modo `development`, as mudanças nos arquivos TypeScript são aplicadas automaticamente sem precisar reiniciar o container. Consulte [Guia de Desenvolvimento](08_DESENVOLVIMENTO.md) para mais detalhes.

### Bedrock Server

Consulte `env.example` para todas as opções disponíveis. As principais são:

- `BEDROCK_SERVER_NAME` - Nome do servidor
- `BEDROCK_GAMEMODE` - Modo de jogo (survival, creative, adventure)
- `BEDROCK_DIFFICULTY` - Dificuldade (peaceful, easy, normal, hard)
- `BEDROCK_MAX_PLAYERS` - Máximo de jogadores
- `BEDROCK_ONLINE_MODE` - Exigir autenticação Xbox Live
- `BEDROCK_WHITE_LIST` - Ativar whitelist

## Configuração do Servidor Bedrock

O arquivo `bedrockServer/server.properties` contém todas as configurações do servidor. As variáveis de ambiente no `.env` sobrescrevem essas configurações quando o servidor inicia.

### Adicionar Addons e Mundos

1. **Addons (Behavior Packs)**: Coloque em `bedrockServer/behavior_packs/`
2. **Resource Packs**: Coloque em `bedrockServer/resource_packs/`
3. **Mundos**: Coloque em `bedrockServer/worlds/`

Os arquivos são sincronizados automaticamente com o container - **não é necessário reiniciar**!

## Docker Compose Override

Para configurações locais que não devem ser commitadas, crie `docker-compose.override.yml`:

```yaml
services:
  api:
    ports:
      - "3001:3000"  # Alterar porta apenas localmente
```

