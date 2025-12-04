import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ClienteService } from '../../src/services/ClienteService.js';
import { ProdutoService } from '../../src/services/ProdutoService.js';
import { CompraService } from '../../src/services/CompraService.js';
import { ClienteModel } from '../../src/models/Cliente.js';
import { ProdutoModel } from '../../src/models/Produto.js';

declare module 'vitest' {
  export interface TestContext {
    mongoServer?: MongoMemoryServer;
  }
}

describe('CompraService', () => {
  let mongoServer: MongoMemoryServer;
  let clienteService: ClienteService;
  let produtoService: ProdutoService;
  let compraService: CompraService;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    
    clienteService = new ClienteService();
    produtoService = new ProdutoService();
    compraService = new CompraService(clienteService, produtoService);
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('realizarCompra', () => {
    it('deve realizar compra com sucesso', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 1000
      });

      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 500
      });

      const resultado = await compraService.realizarCompra('cliente1', 'produto1', 1);

      expect(resultado.sucesso).toBe(true);
      expect(resultado.compra).toBeDefined();
      expect(resultado.compra?.valorTotal).toBe(500);
      expect(resultado.compra?.quantidade).toBe(1);

      const cliente = await ClienteModel.findOne({ id: 'cliente1' });
      expect(cliente?.saldo).toBe(500);

      const produto = await ProdutoModel.findOne({ id: 'produto1' });
      expect(produto?.quantidadeEstoque).toBe(9);
    });

    it('deve falhar quando quantidade é zero ou negativa', async () => {
      const resultado = await compraService.realizarCompra('cliente1', 'produto1', 0);

      expect(resultado.sucesso).toBe(false);
      expect(resultado.erro).toBe('QUANTIDADE_INVALIDA');
    });

    it('deve falhar quando cliente não existe', async () => {
      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 500
      });

      const resultado = await compraService.realizarCompra('inexistente', 'produto1', 1);

      expect(resultado.sucesso).toBe(false);
      expect(resultado.erro).toBe('CLIENTE_NAO_ENCONTRADO');
    });

    it('deve falhar quando produto não existe', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 1000
      });

      const resultado = await compraService.realizarCompra('cliente1', 'inexistente', 1);

      expect(resultado.sucesso).toBe(false);
      expect(resultado.erro).toBe('PRODUTO_NAO_ENCONTRADO');
    });

    it('deve falhar quando estoque é insuficiente', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 1000
      });

      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 5,
        valorUnitario: 500
      });

      const resultado = await compraService.realizarCompra('cliente1', 'produto1', 10);

      expect(resultado.sucesso).toBe(false);
      expect(resultado.erro).toBe('ESTOQUE_INSUFICIENTE');
    });

    it('deve falhar quando saldo é insuficiente', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 100
      });

      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 500
      });

      const resultado = await compraService.realizarCompra('cliente1', 'produto1', 1);

      expect(resultado.sucesso).toBe(false);
      expect(resultado.erro).toBe('SALDO_INSUFICIENTE');
    });

    it('deve calcular valor total corretamente para múltiplas unidades', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 2000
      });

      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 500
      });

      const resultado = await compraService.realizarCompra('cliente1', 'produto1', 3);

      expect(resultado.sucesso).toBe(true);
      expect(resultado.compra?.valorTotal).toBe(1500);
      expect(resultado.compra?.quantidade).toBe(3);

      const cliente = await ClienteModel.findOne({ id: 'cliente1' });
      expect(cliente?.saldo).toBe(500);

      const produto = await ProdutoModel.findOne({ id: 'produto1' });
      expect(produto?.quantidadeEstoque).toBe(7);
    });
  });
});

