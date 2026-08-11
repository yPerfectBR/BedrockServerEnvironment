# 🛠️ Utilidades

[Voltar ao índice](00_INDICE.md)

## Scripts Disponíveis

### Instalação

- `install-all.sh` / `install-all.ps1` - Prepara o ambiente e instala todas as dependências do projeto

O instalador verifica Node.js/npm e Docker antes de instalar os pacotes npm. No Linux, usa `apt`, `dnf` ou `pacman` para cobrir Ubuntu/Debian, Fedora e Arch. No Windows, tenta instalar Node.js LTS e Docker Desktop com `winget` ou Chocolatey.

Ele também processa `script-tools/`, que contém as ferramentas de configuração do ambiente.

### Inicialização

- `start.sh` / `start.ps1` - Inicia todos os serviços Docker

Antes do Docker subir, o start executa o build do addon em `development/` e sincroniza o resultado para `bedrockServer/development_behavior_packs/` e `bedrockServer/development_resource_packs/`.

### Configuração

- `configure.sh` / `configure.ps1` - Abre o menu de configuração de mundos, addon base e UUIDs

Antes de rodar `configure.sh` ou `configure.ps1`, execute `install-all` pelo menos uma vez. Se as dependências de `script-tools/` não tiverem sido instaladas, o script avisa para rodar o instalador.

No Linux/Mac, libere a execução dos scripts da raiz apenas na primeira vez neste PC, depois de clonar o projeto:

```bash
chmod +x install-all.sh configure.sh start.sh
```

Menu:

- **Configurar addon base**: renomeia o addon em `development/` e pode regenerar todos os UUIDs mantendo BP/RP vinculados.
- **Configurar mundo base/padrão**: cria mundo a partir de `bedrockServer/worlds/world-bases/` ou seleciona um mundo existente como padrão.
- **Configurar portas do Bedrock Server**: altera as portas UDP IPv4/IPv6 no `.env`.

Ao trocar o mundo padrão, a ferramenta atualiza o `.env` e grava `world_behavior_packs.json` e `world_resource_packs.json` no mundo com base no addon em `development/`.

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
docker compose logs -f

# Serviço específico
docker compose logs -f bedrock-server
docker compose logs -f api
docker compose logs -f mongodb

# Últimas 100 linhas
docker compose logs --tail=100 bedrock-server
```

## Backup

### Banco de Dados

```bash
# Criar backup
docker compose exec mongodb mongodump --out /backup

# Restaurar backup
docker compose exec mongodb mongorestore /backup
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
npm run local-deploy  # Compila e envia automaticamente
```

Qualquer mudança em `development/scripts/` será compilada e enviada automaticamente para o servidor.

### Scripts do Addon

O `development/scripts/main.ts` é apenas o bootstrap. A organização atual separa responsabilidades:

- `scripts/events/` - inscrição e roteamento de eventos do Bedrock;
- `scripts/services/` - regras de negócio do addon;
- `scripts/database/` - integração HTTP com a API;
- `scripts/utils/` - utilitários como inventário;
- `scripts/constants/` - mensagens e configurações.

## Troubleshooting

### Serviços não iniciam

1. Verifique se o Docker está rodando
2. Verifique se as portas estão disponíveis
3. Verifique os logs: `docker compose logs`

### API não conecta ao MongoDB

1. Verifique se MongoDB está saudável: `docker compose ps mongodb`
2. Verifique as credenciais no `.env`
3. Verifique os logs: `docker compose logs mongodb`

### Porta já em uso

Abra o configurador da sua plataforma e selecione **Configurar portas do Bedrock Server**. No Linux/Mac, o `chmod` só precisa ser feito uma vez após clonar o projeto. O configurador atualiza:

```env
API_PORT=3001
BEDROCK_SERVER_PORT=19132
BEDROCK_SERVER_PORT_V6=19133
BEDROCK_PORT_IPV4=19133
BEDROCK_PORT_IPV6=19134
```
