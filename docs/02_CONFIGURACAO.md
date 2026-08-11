# ⚙️ Configuração

[Voltar ao índice](00_INDICE.md)

## Variáveis de Ambiente

Todas as configurações principais são feitas através do arquivo `.env` na raiz do projeto. Esse arquivo é lido pelo Docker Compose e também pode ser atualizado pelas ferramentas em `script-tools/`.

A `.env` base pode ser versionada para facilitar o setup local. Antes de publicar o projeto em um GitHub real, coloque `.env` no `.gitignore` se ela tiver credenciais, tokens, senhas ou qualquer valor privado.

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

As principais opções são:

- `BEDROCK_SERVER_NAME` - Nome do servidor
- `BEDROCK_GAMEMODE` - Modo de jogo (survival, creative, adventure)
- `BEDROCK_DIFFICULTY` - Dificuldade (peaceful, easy, normal, hard)
- `BEDROCK_MAX_PLAYERS` - Máximo de jogadores
- `BEDROCK_ONLINE_MODE` - Exigir autenticação Xbox Live
- `BEDROCK_WHITE_LIST` - Ativar whitelist
- `BEDROCK_LEVEL_NAME` - Nome da pasta do mundo em `bedrockServer/worlds/`
- `BEDROCK_PORT_IPV4` - Porta UDP IPv4 publicada no host
- `BEDROCK_PORT_IPV6` - Porta UDP IPv6 publicada no host
- `BEDROCK_SERVER_PORT` - Porta IPv4 usada pelo Bedrock Server dentro do container
- `BEDROCK_SERVER_PORT_V6` - Porta IPv6 usada pelo Bedrock Server dentro do container

### Addon Base

O addon base fica nas pastas:

```text
development/behavior_packs/<nome>
development/resource_packs/<nome>
```

Pelo configurador é possível trocar o nome do addon base. Ele renomeia as pastas de `development/`, atualiza os manifests, ajusta `PROJECT_NAME` em `development/.env` e sincroniza a saída gerada para o `bedrockServer/`.

Também existe a opção de regenerar os UUIDs do Behavior Pack e Resource Pack. A ferramenta mantém as dependências entre os packs:

- o Behavior Pack depende do UUID do Resource Pack;
- o Resource Pack depende do UUID do Behavior Pack;
- os mundos existentes recebem os novos `pack_id` nos arquivos `world_behavior_packs.json` e `world_resource_packs.json`.

### Mundo Padrão

Use o configurador para evitar inconsistências entre pasta do mundo, `levelname.txt` e `.env`:

#### Windows
```powershell
.\configure.ps1
```

#### Linux/Mac
```bash
./configure.sh
```

A opção de mundo faz três coisas:

- cria uma cópia de uma base em `bedrockServer/worlds/world-bases/` ou seleciona um mundo existente;
- garante nome único quando precisa alinhar pasta e `levelname.txt`;
- atualiza `BEDROCK_LEVEL_NAME` no `.env`.

Além disso, o configurador escreve/substitui `world_behavior_packs.json` e `world_resource_packs.json` no mundo escolhido usando o UUID e version do addon em `development/`.

### Portas do Bedrock Server

Use o configurador para alterar as portas UDP do Bedrock Server:

#### Windows
```powershell
.\configure.ps1
```

#### Linux/Mac
```bash
./configure.sh
```

A opção de portas atualiza `BEDROCK_PORT_IPV4`, `BEDROCK_PORT_IPV6`, `BEDROCK_SERVER_PORT` e `BEDROCK_SERVER_PORT_V6` no `.env`.

## Configuração do Servidor Bedrock

O arquivo `bedrockServer/server.properties` contém todas as configurações do servidor. As variáveis de ambiente no `.env` sobrescrevem essas configurações quando o servidor inicia.

### Adicionar Addons e Mundos

1. **Behavior Pack fonte**: `development/behavior_packs/`
2. **Resource Pack fonte**: `development/resource_packs/`
3. **Mundos**: `bedrockServer/worlds/`
4. **Bases de mundo**: `bedrockServer/worlds/world-bases/`

O addon é sincronizado para o servidor pelo configurador ou pelo comando `npm run local-deploy` em `development/`.

## Docker Compose Override

Para configurações locais que não devem ser commitadas, crie `docker-compose.override.yml`:

```yaml
services:
  api:
    ports:
      - "3001:3000"  # Alterar porta apenas localmente
```
