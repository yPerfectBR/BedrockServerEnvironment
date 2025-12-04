# 🧪 Rotas e Serviços de Teste

Esta pasta contém rotas, serviços e modelos de teste usados para validar o funcionamento do banco de dados e das rotas da API.

## 📁 Estrutura

```
test/
├── routes/        # Rotas de teste (clientes, produtos, compras)
├── services/      # Serviços de teste
├── models/        # Modelos de teste
└── types/         # Tipos TypeScript de teste
```

## 🎯 Propósito

Estes arquivos servem apenas para:
- Testar a conectividade com o MongoDB
- Validar o funcionamento das rotas da API
- Confirmar que o banco de dados está funcionando corretamente

## ⚠️ Importante

Estas rotas **não são usadas** na API principal. Elas estão separadas para manter o código de produção limpo.

Para usar estas rotas de teste, você precisaria registrá-las manualmente no `index.ts`:

```typescript
import { clienteRoutes } from './test/routes/clientes.js';
import { produtoRoutes } from './test/routes/produtos.js';
import { compraRoutes } from './test/routes/compras.js';

// Registrar rotas de teste
await fastify.register(clienteRoutes, { prefix: '/api/test/clientes' });
await fastify.register(produtoRoutes, { prefix: '/api/test/produtos' });
await fastify.register(compraRoutes, { prefix: '/api/test/compras' });
```

