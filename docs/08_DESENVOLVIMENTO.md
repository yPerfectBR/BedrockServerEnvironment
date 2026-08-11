# 💻 Desenvolvimento

[Voltar ao índice](00_INDICE.md)

Este guia explica como desenvolver e testar o projeto em modo de desenvolvimento com hot-reload (watch mode).

## 🔄 Modo Watch (Hot-Reload)

O projeto suporta desenvolvimento em modo watch, onde as mudanças nos arquivos são automaticamente detectadas e aplicadas sem precisar reiniciar os containers.

### Como Funciona

- **API (server/)**: Mudanças nos arquivos TypeScript são detectadas automaticamente e o servidor é reiniciado
- **Bedrock Server**: Arquivos em `bedrockServer/` são sincronizados automaticamente com o container
- **Addons (development/)**: Use `npm run local-deploy` para deploy automático

---

## 🚀 Configurando Modo Desenvolvimento

### 1. Configurar Variável de Ambiente

Edite o arquivo `.env` e altere:

```env
NODE_ENV=development
```

Ou use o arquivo `docker-compose.override.yml` para desenvolvimento local:

```yaml
services:
  api:
    environment:
      NODE_ENV: development
```

### 2. Reiniciar o Container da API

```bash
# Parar o container
docker compose stop api

# Iniciar novamente (vai detectar NODE_ENV=development)
docker compose up -d api
```

Ou simplesmente:

```bash
docker compose restart api
```

### 3. Verificar Logs

```bash
# Ver logs em tempo real
docker compose logs -f api
```

Você verá algo como:

```
🚀 Servidor rodando em http://localhost:3000
📊 Health check: http://localhost:3000/health
🎮 Player Data: http://localhost:3000/api/playerData
```

E quando você modificar um arquivo TypeScript:

```
[tsx] watching /app/src/index.ts
[tsx] change detected, restarting...
🚀 Servidor rodando em http://localhost:3000
```

---

## 📝 Desenvolvendo a API

### Estrutura de Arquivos

```
server/
├── src/
│   ├── config/        # Configurações (database, etc)
│   ├── models/        # Modelos Mongoose
│   ├── routes/        # Rotas da API
│   ├── services/      # Serviços de negócio
│   ├── types/         # Tipos TypeScript
│   └── index.ts       # Arquivo principal
├── tests/             # Testes
├── package.json
└── tsconfig.json
```

### Workflow de Desenvolvimento

1. **Editar arquivos TypeScript** em `server/src/`
2. **Salvar o arquivo**
3. **O servidor reinicia automaticamente** (modo watch)
4. **Testar a mudança** via API ou logs

### Exemplo: Adicionar Nova Rota

1. Crie o arquivo `server/src/routes/novaRota.ts`:

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function novaRotaRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      sucesso: true,
      mensagem: 'Nova rota funcionando!'
    });
  });
}
```

2. Registre no `server/src/index.ts`:

```typescript
import { novaRotaRoutes } from './routes/novaRota.js';

// ... dentro de iniciarServidor ...
await fastify.register(novaRotaRoutes, { prefix: '/api/novaRota' });
```

3. Salve os arquivos - o servidor reinicia automaticamente
4. Teste: `curl http://localhost:3000/api/novaRota`

---

## 🎮 Desenvolvendo Addons

### Modo Watch para Addons

No diretório `development/`:

```bash
cd development

# Executar apenas uma vez (configurar permissões)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Modo watch - compila e envia automaticamente para o servidor
npm run local-deploy
```

Qualquer mudança nos arquivos TypeScript em `development/scripts/` será:
1. Compilada automaticamente
2. Enviada como saída gerada para o servidor Bedrock
3. O servidor Bedrock detecta e recarrega o addon

### Estrutura de Arquivos do Addon

```
development/
├── scripts/
│   ├── constants/     # Constantes
│   ├── database/      # Classes Database
│   ├── events/        # Registro e roteamento de eventos Bedrock
│   ├── services/      # Regras de negócio do addon
│   ├── types/         # Tipos TypeScript
│   ├── utils/         # Utilitários
│   └── main.ts        # Bootstrap do addon
├── behavior_packs/    # Packs compilados
├── resource_packs/    # Resource packs
└── package.json
```

O `main.ts` deve ficar pequeno e apenas registrar módulos. Para novas interações, prefira criar arquivos em `scripts/events/` e mover lógica reutilizável para `scripts/services/`.

### Versões do Addon

Compatibilidade do addon:

- `@minecraft/server` `^2.9.0`
- `@minecraft/server-ui` `^2.1.0`
- `@minecraft/server-net` `^1.0.0-beta.1.26.40-stable`
- `@minecraft/vanilla-data` `^1.26.40`

No `@minecraft/server-net`, os métodos HTTP usam os nomes maiúsculos do enum, por exemplo `HttpRequestMethod.POST` e `HttpRequestMethod.GET`.

### Configurador do Ambiente

Na raiz do projeto:

Linux/Mac:

```bash
./configure.sh
```

Windows:

```powershell
.\configure.ps1
```

Use esse menu para configurar o addon base, regenerar UUIDs, trocar o mundo padrão e criar mundo a partir de base. Ele usa `development/` como fonte do addon e mantém os manifests, `.env`, `levelname.txt` e arquivos `world_*_packs.json` sincronizados.

---

## 🐛 Debugging

### Ver Logs em Tempo Real

```bash
# API
docker compose logs -f api

# Bedrock Server
docker compose logs -f bedrock-server

# MongoDB
docker compose logs -f mongodb

# Todos os serviços
docker compose logs -f
```

### Verificar se Hot-Reload Está Funcionando

1. Edite um arquivo em `server/src/`
2. Salve o arquivo
3. Verifique os logs:

```bash
docker compose logs -f api | grep -i "change\|restart\|watching"
```

Você deve ver mensagens como:
- `[tsx] change detected, restarting...`
- `[tsx] watching /app/src/...`

### Problemas Comuns

#### Hot-reload não funciona

1. **Verificar NODE_ENV**:
   ```bash
   docker compose exec api printenv NODE_ENV
   ```
   Deve retornar `development`

2. **Verificar volumes montados**:
   ```bash
   docker compose exec api ls -la /app/src
   ```
   Deve listar os arquivos do seu `server/src/`

3. **Reiniciar o container**:
   ```bash
   docker compose restart api
   ```

#### Mudanças não aparecem

1. Verifique se o arquivo foi salvo
2. Verifique os logs para erros de compilação
3. Verifique se o arquivo está no volume correto

#### Erros de compilação TypeScript

Os erros aparecem nos logs. Exemplo:

```bash
docker compose logs api | grep -i error
```

---

## 🧪 Testando Mudanças

### Testar API Localmente

```bash
# Health check
curl http://localhost:3000/health

# Endpoint específico
curl http://localhost:3000/api/playerData/SeuNick
```

### Testar no Jogo

1. Faça mudanças no addon
2. O modo watch compila e envia automaticamente
3. Teste no jogo imediatamente

### Executar Testes

```bash
# Entrar no container da API
docker compose exec api sh

# Executar testes
npm test

# Testes com cobertura
npm run test:coverage
```

Ou localmente (se tiver Node.js instalado):

```bash
cd server
npm test
```

---

## 📦 Modo Produção vs Desenvolvimento

### Produção (`NODE_ENV=production`)

- TypeScript é compilado no build da imagem
- Código compilado é executado (`npm start`)
- Mais rápido, mas requer rebuild para mudanças

### Desenvolvimento (`NODE_ENV=development`)

- TypeScript é executado diretamente com `tsx watch`
- Hot-reload automático
- Mudanças são aplicadas imediatamente
- Ideal para desenvolvimento

---

## 🔧 Comandos Úteis

### Reiniciar Apenas a API

```bash
docker compose restart api
```

### Rebuild da API (após mudanças em package.json)

```bash
docker compose build api
docker compose up -d api
```

### Ver Status dos Containers

```bash
docker compose ps
```

### Entrar no Container da API

```bash
docker compose exec api sh
```

### Limpar e Reconstruir Tudo

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 💡 Dicas

1. **Use modo development apenas em desenvolvimento local**
2. **Sempre teste em produção antes de fazer deploy**
3. **Mantenha os logs abertos em um terminal separado**
4. **Use TypeScript strict mode para pegar erros mais cedo**
5. **Faça commits frequentes durante desenvolvimento**

---

## 📚 Próximos Passos

- [Criar Novo Tipo de Dados](07_CRIAR_NOVO_TIPO_DADOS.md) - Guia completo
- [API Documentation](03_API.md) - Documentação da API
- [Utilidades](05_UTILIDADES.md) - Scripts e ferramentas
