# 🚀 Início Rápido

[Voltar ao índice](00_INDICE.md)

## 1. Configuração Inicial

Editar configurações é opcional, porque os padrões já funcionam.

### Windows (PowerShell)
```powershell
notepad .env
```

### Linux/Mac
```bash
nano .env
```

O projeto usa o arquivo `.env` da raiz. A variável `BEDROCK_LEVEL_NAME` define qual pasta em `bedrockServer/worlds/` será usada pelo container do Bedrock Server.

## 2. Instalar Dependências

Os scripts abaixo também verificam Node.js/npm e Docker. Se algo estiver ausente, eles tentam instalar automaticamente antes de rodar `npm install` nos subprojetos.

### Windows (PowerShell)
```powershell
.\install-all.ps1
```

### Linux/Mac
Execute esta linha apenas na primeira vez neste PC, depois de clonar o projeto:

```bash
chmod +x install-all.sh configure.sh start.sh
```

Depois instale:

```bash
./install-all.sh
```

No Linux, o instalador cobre as principais famílias de distro:

- Ubuntu/Debian e derivadas: `apt`
- Fedora: `dnf`
- Arch/Manjaro/EndeavourOS: `pacman`

No Windows, o instalador tenta usar `winget` e, se não existir, Chocolatey. A instalação do Docker Desktop pode demorar alguns minutos, pedir permissão de Administrador e reabrir o instalador em uma nova janela na raiz do projeto. Essa janela continua o fluxo completo, incluindo pacotes npm, e espera uma tecla antes de fechar. A janela original aguarda esse processo terminar. Depois de instalar Docker Desktop ou Node.js pela primeira vez, talvez seja necessário abrir um novo terminal.

Quando o Docker é instalado pelo script, ele não é configurado para iniciar automaticamente com o sistema.

## 3. Configurar Addon e Mundo

Depois de instalar as dependências, use o configurador da raiz:

### Windows (PowerShell)
```powershell
.\configure.ps1
```

### Linux/Mac
```bash
./configure.sh
```

Com ele você pode:

- renomear o addon base em `development/`;
- regenerar UUIDs do addon mantendo a dependência entre Behavior Pack e Resource Pack;
- criar um mundo novo a partir das bases em `bedrockServer/worlds/world-bases/`;
- tornar um mundo existente o padrão do Docker.

Quando um mundo é criado ou escolhido como padrão, o configurador atualiza `world_behavior_packs.json` e `world_resource_packs.json` no mundo com o UUID e version do addon em `development/`.

## 4. Iniciar Serviços

### Windows (PowerShell)
```powershell
.\start.ps1
```

Se o Docker Desktop estiver instalado mas parado, o `start.ps1` pergunta se você quer tentar iniciar agora. Quando o serviço do Docker precisar de Administrador, ele abre uma janela elevada, a janela original aguarda ela terminar e depois continua.

### Linux/Mac
```bash
./start.sh
```

Antes de subir os containers, o script de start compila o addon em `development/` e sincroniza a saída para o `bedrockServer/`.

### Ou manualmente
```bash
docker compose up -d
```

## 5. Verificar Status

```bash
# Ver todos os serviços
docker compose ps

# Ver logs
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f bedrock-server
```

## 6. Conectar ao Servidor

- **IP**: `localhost` (ou seu IP local)
- **Porta**: `19132` (UDP)
- **Versão**: Bedrock `1.26.40`

## 7. Acessar API

- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Documentação**: Veja `docs/03_API.md`

## 📝 Comandos Úteis

```bash
# Parar serviços
docker compose down

# Reiniciar um serviço
docker compose restart bedrock-server

# Ver logs em tempo real
docker compose logs -f bedrock-server
```

## ⚠️ Importante

1. **EULA**: Certifique-se de que `BEDROCK_EULA=TRUE` no arquivo `.env`
2. **Portas**: Abra as portas UDP 19132/19133 no firewall
3. **Addon em desenvolvimento**: edite os packs em `development/behavior_packs/` e `development/resource_packs/`
