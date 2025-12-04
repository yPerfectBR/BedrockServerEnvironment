# 🎮 Bedrock Server

## Estrutura de Pastas

```
bedrockServer/
├── behavior_packs/     # Behavior packs (addons)
├── resource_packs/      # Resource packs
├── worlds/             # Mundos do servidor
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

Os addons são desenvolvidos na pasta `development/`. Para compilar:

```bash
cd development
npm install
npm run build
npm run local-deploy
```

### Instalação

1. Coloque os arquivos em `bedrockServer/behavior_packs/` ou `bedrockServer/resource_packs/`
2. Reinicie o servidor ou recarregue o mundo

## Troubleshooting

### Servidor não inicia

1. Verifique os logs: `docker-compose logs bedrock-server`
2. Verifique se a porta está em uso
3. Verifique se `BEDROCK_EULA=TRUE` no `.env`

### Addons não aparecem

1. Verifique se os arquivos estão na pasta correta
2. Verifique os logs do servidor
3. Alguns addons requerem reinicialização do servidor

