# 📡 API - Documentação

A API está disponível em `http://localhost:3000` (ou porta configurada no `.env`).

## Endpoints

### Health Check

```
GET /health
```

Retorna o status da API e conexão com o banco de dados.

### Player Data

```
GET    /api/playerData/:nick    - Carregar dados do jogador
POST   /api/playerData/:nick    - Salvar dados do jogador
DELETE /api/playerData/:nick    - Deletar dados do jogador
GET    /api/playerData          - Listar todos os jogadores
```

### Test Endpoint

```
GET /test
```

Endpoint de teste para verificar conectividade do Bedrock server.

## Estrutura de Resposta

Todas as respostas seguem o formato:

```json
{
  "sucesso": true,
  "dados": { ... },
  "mensagem": "Operação realizada com sucesso"
}
```

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Exemplos

Consulte `docs/07_CRIAR_NOVO_TIPO_DADOS.md` para um guia completo de como criar novos tipos de dados e rotas.

