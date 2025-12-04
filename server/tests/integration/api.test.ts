import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify from 'fastify';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Database } from '../../src/config/database.js';
import { clienteRoutes } from '../../src/routes/clientes.js';
import { produtoRoutes } from '../../src/routes/produtos.js';
import { compraRoutes } from '../../src/routes/compras.js';

describe('API Integration Tests', () => {
  let mongoServer: MongoMemoryServer;
  let fastify: ReturnType<typeof Fastify>;
  let db: Database | null = null;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    fastify = Fastify({ logger: false });
    await fastify.register(clienteRoutes, { prefix: '/api/clientes' });
    await fastify.register(produtoRoutes, { prefix: '/api/produtos' });
    await fastify.register(compraRoutes, { prefix: '/api/compras' });

    db = Database.getInstance();
    await db.connect(mongoUri);

    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
    if (db) {
      await db.disconnect();
    }
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  describe('Clientes API', () => {
    it('deve criar um cliente', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/clientes',
        payload: {
          id: 'cliente1',
          nome: 'João Silva',
          saldo: 1000
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(true);
      expect(body.dados?.id).toBe('cliente1');
      expect(body.dados?.nome).toBe('João Silva');
      expect(body.dados?.saldo).toBe(1000);
    });

    it('deve buscar todos os clientes', async () => {
      await fastify.inject({
        method: 'POST',
        url: '/api/clientes',
        payload: {
          id: 'cliente1',
          nome: 'João',
          saldo: 100
        }
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/clientes'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(true);
      expect(Array.isArray(body.dados)).toBe(true);
      expect(body.dados).toHaveLength(1);
    });

    it('deve buscar cliente por ID', async () => {
      await fastify.inject({
        method: 'POST',
        url: '/api/clientes',
        payload: {
          id: 'cliente1',
          nome: 'João',
          saldo: 100
        }
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/clientes/cliente1'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(true);
      expect(body.dados?.id).toBe('cliente1');
    });

    it('deve adicionar saldo ao cliente', async () => {
      await fastify.inject({
        method: 'POST',
        url: '/api/clientes',
        payload: {
          id: 'cliente1',
          nome: 'João',
          saldo: 100
        }
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/clientes/cliente1/adicionar-saldo',
        payload: {
          valor: 50
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(true);
      expect(body.dados?.saldo).toBe(150);
    });
  });

  describe('Produtos API', () => {
    it('deve criar um produto', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: {
          id: 'produto1',
          nome: 'Notebook',
          quantidadeEstoque: 10,
          valorUnitario: 2500
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(true);
      expect(body.dados?.id).toBe('produto1');
      expect(body.dados?.nome).toBe('Notebook');
    });

    it('deve buscar todos os produtos', async () => {
      await fastify.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: {
          id: 'produto1',
          nome: 'Notebook',
          quantidadeEstoque: 10,
          valorUnitario: 2500
        }
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/produtos'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(true);
      expect(Array.isArray(body.dados)).toBe(true);
    });
  });

  describe('Compras API', () => {
    it('deve realizar uma compra com sucesso', async () => {
      await fastify.inject({
        method: 'POST',
        url: '/api/clientes',
        payload: {
          id: 'cliente1',
          nome: 'João',
          saldo: 1000
        }
      });

      await fastify.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: {
          id: 'produto1',
          nome: 'Notebook',
          quantidadeEstoque: 10,
          valorUnitario: 500
        }
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/compras',
        payload: {
          clienteId: 'cliente1',
          produtoId: 'produto1',
          quantidade: 1
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(true);
      expect(body.dados?.compra).toBeDefined();
      expect(body.dados?.compra?.valorTotal).toBe(500);

      const clienteResponse = await fastify.inject({
        method: 'GET',
        url: '/api/clientes/cliente1'
      });
      const clienteBody = JSON.parse(clienteResponse.body);
      expect(clienteBody.dados?.saldo).toBe(500);

      const produtoResponse = await fastify.inject({
        method: 'GET',
        url: '/api/produtos/produto1'
      });
      const produtoBody = JSON.parse(produtoResponse.body);
      expect(produtoBody.dados?.quantidadeEstoque).toBe(9);
    });

    it('deve falhar quando saldo é insuficiente', async () => {
      await fastify.inject({
        method: 'POST',
        url: '/api/clientes',
        payload: {
          id: 'cliente1',
          nome: 'João',
          saldo: 100
        }
      });

      await fastify.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: {
          id: 'produto1',
          nome: 'Notebook',
          quantidadeEstoque: 10,
          valorUnitario: 500
        }
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/compras',
        payload: {
          clienteId: 'cliente1',
          produtoId: 'produto1',
          quantidade: 1
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(false);
      expect(body.erro).toBe('SALDO_INSUFICIENTE');
    });

    it('deve falhar quando estoque é insuficiente', async () => {
      await fastify.inject({
        method: 'POST',
        url: '/api/clientes',
        payload: {
          id: 'cliente1',
          nome: 'João',
          saldo: 1000
        }
      });

      await fastify.inject({
        method: 'POST',
        url: '/api/produtos',
        payload: {
          id: 'produto1',
          nome: 'Notebook',
          quantidadeEstoque: 5,
          valorUnitario: 500
        }
      });

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/compras',
        payload: {
          clienteId: 'cliente1',
          produtoId: 'produto1',
          quantidade: 10
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.sucesso).toBe(false);
      expect(body.erro).toBe('ESTOQUE_INSUFICIENTE');
    });
  });
});

