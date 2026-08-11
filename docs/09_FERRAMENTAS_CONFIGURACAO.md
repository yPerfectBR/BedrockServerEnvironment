# Ferramentas de Configuração

[Voltar ao índice](00_INDICE.md)

O diretório `script-tools/` contém uma CLI em Node.js para configurar partes do ambiente sem editar vários arquivos manualmente.

## Como Usar

No Linux/Mac, execute esta linha apenas na primeira vez neste PC, depois de clonar o projeto:

```bash
chmod +x install-all.sh configure.sh start.sh
```

### Instalar Dependências

Windows:

```powershell
.\install-all.ps1
```

Linux/Mac:

```bash
./install-all.sh
```

### Abrir Configurador

Windows:

```powershell
.\configure.ps1
```

Linux/Mac:

```bash
./configure.sh
```

Os scripts funcionam em Windows e Linux porque a lógica principal usa APIs nativas do Node.js.

O start da raiz também usa essa sincronização: ele compila o addon em `development/`, copia os scripts gerados para o Behavior Pack do servidor e só depois inicia os containers.

## Configurar CPU/RAM dos Containers

Essa opção altera os limites usados pelo Docker Compose e salva tudo no `.env`.

Padrões:

- Bedrock Server: `2` CPUs e `3g` de RAM
- API: `0.5` CPU e `512m` de RAM
- MongoDB: `0.75` CPU e `1g` de RAM

Depois de mudar os valores, reinicie os containers com `start` para aplicar.

## Docker: Terminal/Logs

Essa opção usa o Docker Compose do projeto para tarefas rápidas de diagnóstico:

- abrir um shell `sh`, `bash` ou `mongosh` em um serviço;
- selecionar um ou vários serviços para ver logs;
- carregar uma quantidade de linhas recentes;
- acompanhar logs em tempo real com `-f`.

Para logs, escolha `0` para todos ou informe os números separados por vírgula, como `1,3`.

## Configurar Addon Base

Essa opção define o nome do addon base nas pastas fonte:

```text
development/behavior_packs/<addon>
development/resource_packs/<addon>
```

Também são atualizados:

- `header.name` nos manifests;
- `PROJECT_NAME` em `development/.env`;
- saída gerada em `bedrockServer/development_behavior_packs/` e `bedrockServer/development_resource_packs/`.

## Configurar Mundo Base/Padrão

Essa opção permite:

- selecionar um mundo existente em `bedrockServer/worlds/` como padrão;
- criar um mundo novo copiando uma base de `bedrockServer/worlds/world-bases/`;
- exigir nome único quando pasta e `levelname.txt` precisam ser alinhados;
- atualizar `BEDROCK_LEVEL_NAME` no `.env`.

Ao finalizar, o mundo recebe ou substitui:

- `world_behavior_packs.json`;
- `world_resource_packs.json`.

Esses arquivos são gerados a partir do UUID e version do addon em `development/`:

- `development/behavior_packs/<addon>/manifest.json`;
- `development/resource_packs/<addon>/manifest.json`.

## Configurar Portas do Bedrock Server

Essa opção altera as portas UDP do servidor no `.env`:

- `BEDROCK_PORT_IPV4`;
- `BEDROCK_PORT_IPV6`;
- `BEDROCK_SERVER_PORT`;
- `BEDROCK_SERVER_PORT_V6`.

O Docker Compose usa `BEDROCK_PORT_IPV4` e `BEDROCK_PORT_IPV6` para publicar as portas no host. O container recebe `BEDROCK_SERVER_PORT` e `BEDROCK_SERVER_PORT_V6` como portas internas do Bedrock Server.

As portas precisam estar entre `1` e `65535`, e IPv4/IPv6 não podem usar o mesmo valor no host.

## Regenerar UUIDs

Durante a configuração do addon base, a CLI pode regenerar todos os UUIDs do addon:

- header do Behavior Pack;
- módulo do Behavior Pack;
- header do Resource Pack;
- módulo do Resource Pack.

A ferramenta mantém a relação correta:

- Resource Pack depende do UUID do Behavior Pack;
- Behavior Pack depende do UUID do Resource Pack.

Depois disso, os mundos existentes recebem os novos `pack_id` nos arquivos `world_behavior_packs.json` e `world_resource_packs.json`.

## Organização dos Arquivos

Cada opção fica em um arquivo separado:

```text
script-tools/config/
├── addon-base.js
├── bedrock-ports.js
├── world-base.js
├── world-pack-references.js
├── env-file.js
├── file-utils.js
├── names.js
├── paths.js
├── prompt.js
└── index.js
```
