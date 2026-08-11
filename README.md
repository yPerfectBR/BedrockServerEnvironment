# Bedrock Server Environment

Ambiente Docker para servidor Minecraft Bedrock com API TypeScript, MongoDB e desenvolvimento de addons.

## 🏗️ Estrutura do Projeto

```
.
├── bedrockServer/          # Arquivos do servidor Bedrock
│   └── worlds/             # Mundos do servidor e bases de mundo
├── server/                 # API TypeScript com Fastify
│   ├── src/               # Código fonte
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Serviços de negócio
│   │   ├── models/        # Modelos do banco de dados
│   │   ├── types/         # Tipos TypeScript
│   │   └── test/          # Rotas e serviços de teste
│   └── tests/             # Testes unitários e de integração
├── development/           # Fonte dos addons Bedrock
├── script-tools/          # Ferramentas de configuração do ambiente
├── docs/                  # Documentação organizada
├── docker-compose.yml     # Orquestração dos serviços
└── .env                   # Variáveis de ambiente usadas pelo Docker
```

## 🚀 Início Rápido

1. **Configuração Inicial**
   ```bash
   # Edite o .env se quiser mudar portas, nome do servidor ou mundo padrão.
   # O Docker usa BEDROCK_LEVEL_NAME para escolher a pasta do mundo.
   ```

2. **Instalar Dependências e Ferramentas**
   No Linux/Mac, execute esta linha apenas na primeira vez neste PC, depois de clonar o projeto:
   ```bash
   chmod +x install-all.sh configure.sh start.sh
   ```

   Windows:
   ```powershell
   .\install-all.ps1
   ```

   Linux/Mac:
   ```bash
   ./install-all.sh
   ```

   O instalador verifica Node.js/npm e Docker. No Linux ele tenta instalar automaticamente em distribuições baseadas em Ubuntu/Debian, Fedora e Arch. No Windows ele usa `winget` ou Chocolatey quando disponíveis.

3. **Configurar Addon e Mundo**
   Windows:
   ```powershell
   .\configure.ps1
   ```

   Linux/Mac:
   ```bash
   ./configure.sh
   ```

   O configurador usa `development/` como fonte do addon, sincroniza a saída para o `bedrockServer/`, cria mundos a partir de bases e ajusta o mundo padrão do Docker.

4. **Iniciar Serviços**
   Windows:
   ```powershell
   .\start.ps1
   ```

   Linux/Mac:
   ```bash
   ./start.sh
   ```

   O start compila o addon em `development/` e sincroniza a saída para o `bedrockServer/` antes de subir os containers.

5. **Conectar ao Servidor**
   - IP: `localhost`
   - Porta: `19132` (UDP)

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

- **[Índice da Documentação](docs/00_INDICE.md)** - Ponto de entrada para todos os guias
- **[Início Rápido](docs/01_INICIO_RAPIDO.md)** - Guia rápido de instalação
- **[Configuração](docs/02_CONFIGURACAO.md)** - Configurações detalhadas
- **[API](docs/03_API.md)** - Documentação da API
- **[Bedrock Server](docs/04_BEDROCK_SERVER.md)** - Configuração do servidor
- **[Utilidades](docs/05_UTILIDADES.md)** - Scripts e ferramentas
- **[Git](docs/06_GIT.md)** - Configuração do repositório
- **[Criar Novo Tipo de Dados](docs/07_CRIAR_NOVO_TIPO_DADOS.md)** - Guia completo para criar novos tipos de dados
- **[Desenvolvimento](docs/08_DESENVOLVIMENTO.md)** - Guia de desenvolvimento com hot-reload
- **[Ferramentas de Configuração](docs/09_FERRAMENTAS_CONFIGURACAO.md)** - CLI para mundos base, addon base e UUIDs

## 🎮 Serviços

### MongoDB
- Porta: `27017`
- Banco: `bedrock_db`

### API
- URL: `http://localhost:3000`
- Health: `http://localhost:3000/health`

### Bedrock Server
- Porta: `19132` (UDP IPv4)
- Porta: `19133` (UDP IPv6)

## 🛠️ Desenvolvimento

### API
```bash
cd server
npm run dev
npm test
```

### Addons
```bash
cd development
npm run local-deploy
```

Compatibilidade do addon: Bedrock `1.26.40`, `@minecraft/server` `2.9.0`, `@minecraft/server-ui` `2.1.0`, `@minecraft/server-net` beta estável de `1.26.40` e `@minecraft/vanilla-data` `1.26.40`.

## 📝 Notas Importantes

1. **EULA**: Você deve aceitar o EULA da Mojang definindo `BEDROCK_EULA=TRUE` no `.env`
2. **Portas**: Certifique-se de que as portas UDP 19132/19133 estão abertas no firewall
3. **Mundos base**: Use o configurador da sua plataforma para criar mundos a partir das bases já preparadas com recursos beta/script.
4. **GitHub público**: coloque `.env` no `.gitignore` antes de publicar o projeto com credenciais ou valores privados.
5. **Backup**: Faça backup regular da pasta `bedrockServer/worlds/`

## 📄 Licença

MIT
