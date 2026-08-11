# 🎮 Bedrock Server

[Voltar ao índice](00_INDICE.md)

## Estrutura de Pastas

```
bedrockServer/
├── worlds/             # Mundos do servidor
│   └── world-bases/    # Bases de mundo para criar novos mundos
├── config/             # Configurações customizadas
├── server.properties   # Propriedades do servidor
└── permissions.json    # Permissões
```

## Comandos do Servidor

O Bedrock Server não possui RCON nativo. Para executar comandos, consulte `docs/05_UTILIDADES.md#console-do-servidor`.

### Comandos Disponíveis

- `list` - Lista jogadores online
- `op <player>` - Dá permissões de operador
- `deop <player>` - Remove permissões de operador
- `kick <player> [reason]` - Expulsa um jogador
- `ban <player>` - Bane um jogador
- `whitelist add <player>` - Adiciona à whitelist
- `stop` - Para o servidor
- `save-all` - Salva o mundo

## Configuração

### server.properties

Arquivo principal de configuração do servidor. As principais opções:

- `server-name` - Nome do servidor
- `gamemode` - Modo de jogo
- `difficulty` - Dificuldade
- `max-players` - Máximo de jogadores
- `online-mode` - Exigir autenticação Xbox Live
- `allow-list` - Ativar whitelist

### permissions.json

Define permissões de módulos para scripts. Exemplo:

```json
{
  "allowed_modules": [
    "@minecraft/server-net"
  ]
}
```

## Addons

### Desenvolvimento

Os addons são desenvolvidos na pasta `development/`. Compatibilidade:

- `@minecraft/server` `2.9.0`
- `@minecraft/server-ui` `2.1.0`
- `@minecraft/server-net` beta estável de `1.26.40`
- `@minecraft/vanilla-data` `1.26.40`

Para compilar:

```bash
cd development
npm install
npm run build
npm run local-deploy
```

### Instalação

1. Use `development/` como fonte do addon e `npm run local-deploy` para enviar a saída para o servidor
2. Reinicie o servidor ou recarregue o mundo

### Mundos Base

As bases de mundo ficam em `bedrockServer/worlds/world-bases/`. Elas já podem carregar opções como beta APIs de script. Para criar um mundo a partir de uma base:

Linux/Mac:

```bash
./configure.sh
```

Windows:

```powershell
.\configure.ps1
```

Ao criar ou selecionar o mundo principal, a ferramenta:

- atualiza `BEDROCK_LEVEL_NAME` no `.env`;
- ajusta `levelname.txt` quando necessário;
- grava `world_behavior_packs.json` e `world_resource_packs.json` no mundo usando UUID e version do addon em `development/`.

## Troubleshooting

### Servidor não inicia

1. Verifique os logs: `docker compose logs bedrock-server`
2. Verifique se a porta está em uso
3. Verifique se `BEDROCK_EULA=TRUE` no `.env`

### Addons não aparecem

1. Verifique se os arquivos estão na pasta correta
2. Verifique os logs do servidor
3. Alguns addons requerem reinicialização do servidor
