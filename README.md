# Bedrock Server - Projeto Completo

Projeto completo para gerenciar um servidor Minecraft Bedrock com API TypeScript, MongoDB e Docker.

## 🏗️ Estrutura do Projeto

```
.
├── bedrockServer/          # Arquivos do servidor Bedrock
├── server/                 # API TypeScript com Fastify
│   ├── src/               # Código fonte
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Serviços de negócio
│   │   ├── models/        # Modelos do banco de dados
│   │   ├── types/         # Tipos TypeScript
│   │   └── test/          # Rotas e serviços de teste
│   └── tests/             # Testes unitários e de integração
├── development/           # Desenvolvimento de addons
├── docs/                  # Documentação organizada
├── docker-compose.yml     # Orquestração dos serviços
└── .env.example          # Exemplo de variáveis de ambiente
```

## 🚀 Início Rápido

1. **Configuração Inicial**
   ```bash
   transformar o arquivo env.exemple em .env caso não tenha um .env
   ```

2. **Instalar Dependências (caso instale as dependências, não precisará mais usar o "npm install" em outras partes do projeto)**
   ```bash
   # Windows
   .\install-all.ps1
   
   # Linux/Mac
   ./install-all.sh
   ```

3. **Iniciar Serviços**
   ```bash
   # Windows
   .\start.ps1
   
   # Linux/Mac
   ./start.sh
   ```

4. **Conectar ao Servidor**
   - IP: `localhost`
   - Porta: `19132` (UDP)

## 📚 Documentação

Toda a documentação está organizada na pasta `docs/`:

- **[Início Rápido](docs/01_INICIO_RAPIDO.md)** - Guia rápido de instalação
- **[Configuração](docs/02_CONFIGURACAO.md)** - Configurações detalhadas
- **[API](docs/03_API.md)** - Documentação da API
- **[Bedrock Server](docs/04_BEDROCK_SERVER.md)** - Configuração do servidor
- **[Utilidades](docs/05_UTILIDADES.md)** - Scripts e ferramentas
- **[Git](docs/06_GIT.md)** - Configuração do repositório
- **[Criar Novo Tipo de Dados](docs/07_CRIAR_NOVO_TIPO_DADOS.md)** - Guia completo para criar novos tipos de dados
- **[Desenvolvimento](docs/08_DESENVOLVIMENTO.md)** - Guia de desenvolvimento com hot-reload

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
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass (executar apenas uma vez no pc)
npx just-scripts local-deploy --watch (permite desenvolver o addon e ele será mandado automaticamente para o servidor)
```

## 📝 Notas Importantes

1. **EULA**: Você deve aceitar o EULA da Mojang definindo `BEDROCK_EULA=TRUE` no `.env`
2. **Portas**: Certifique-se de que as portas UDP 19132/19133 estão abertas no firewall
3. **Backup**: Faça backup regular da pasta `bedrockServer/worlds/`

## 📄 Licença

MIT
