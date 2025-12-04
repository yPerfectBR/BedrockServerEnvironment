# 🚀 Início Rápido

## 1. Configuração Inicial

```bash
# Copiar arquivo de configuração
cp env.example .env

# Editar configurações (opcional - os padrões já funcionam)
# Windows: notepad .env
# Linux/Mac: nano .env
```

## 2. Instalar Dependências

### Windows (PowerShell)
```powershell
.\install-all.ps1
```

### Linux/Mac
```bash
chmod +x install-all.sh
./install-all.sh
```

## 3. Iniciar Serviços

### Windows (PowerShell)
```powershell
.\start.ps1
```

### Linux/Mac
```bash
chmod +x start.sh
./start.sh
```

### Ou manualmente
```bash
docker-compose up -d
```

## 4. Verificar Status

```bash
# Ver todos os serviços
docker-compose ps

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f bedrock-server
```

## 5. Conectar ao Servidor

- **IP**: `localhost` (ou seu IP local)
- **Porta**: `19132` (UDP)
- **Versão**: Use a versão mais recente do Minecraft Bedrock

## 6. Acessar API

- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Documentação**: Veja `docs/03_API.md`

## 📝 Comandos Úteis

```bash
# Parar serviços
docker-compose down

# Reiniciar um serviço
docker-compose restart bedrock-server

# Ver logs em tempo real
docker-compose logs -f bedrock-server
```

## ⚠️ Importante

1. **EULA**: Certifique-se de que `BEDROCK_EULA=TRUE` no arquivo `.env`
2. **Portas**: Abra as portas UDP 19132/19133 no firewall
3. **Addons**: Coloque em `bedrockServer/behavior_packs/` ou `bedrockServer/resource_packs/`

