import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ProdutoService } from '../../src/services/ProdutoService.js';
import { ProdutoModel } from '../../src/models/Produto.js';

describe('ProdutoService', () => {
  let mongoServer: MongoMemoryServer;
  let produtoService: ProdutoService;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    produtoService = new ProdutoService();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('criar', () => {
    it('deve criar um produto com sucesso', async () => {
      const produto = await produtoService.criar({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 2500.0
      });

      expect(produto).toBeDefined();
      expect(produto.id).toBe('produto1');
      expect(produto.nome).toBe('Notebook');
      expect(produto.quantidadeEstoque).toBe(10);
      expect(produto.valorUnitario).toBe(2500.0);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar produto quando encontrado', async () => {
      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 2500
      });

      const produto = await produtoService.buscarPorId('produto1');

      expect(produto).not.toBeNull();
      expect(produto?.id).toBe('produto1');
    });

    it('deve retornar null quando produto não encontrado', async () => {
      const produto = await produtoService.buscarPorId('inexistente');
      expect(produto).toBeNull();
    });
  });

  describe('buscarTodos', () => {
    it('deve retornar todos os produtos', async () => {
      await ProdutoModel.create([
        { id: 'produto1', nome: 'Notebook', quantidadeEstoque: 10, valorUnitario: 2500 },
        { id: 'produto2', nome: 'Mouse', quantidadeEstoque: 50, valorUnitario: 50 }
      ]);

      const produtos = await produtoService.buscarTodos();

      expect(produtos).toHaveLength(2);
    });
  });

  describe('atualizarEstoque', () => {
    it('deve atualizar estoque do produto', async () => {
      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 2500
      });

      const produto = await produtoService.atualizarEstoque('produto1', 25);

      expect(produto?.quantidadeEstoque).toBe(25);
    });

    it('deve lançar erro quando quantidade é negativa', async () => {
      await expect(
        produtoService.atualizarEstoque('produto1', -10)
      ).rejects.toThrow('Quantidade em estoque não pode ser negativa');
    });
  });

  describe('adicionarEstoque', () => {
    it('deve adicionar estoque ao produto', async () => {
      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 2500
      });

      const produto = await produtoService.adicionarEstoque('produto1', 5);

      expect(produto?.quantidadeEstoque).toBe(15);
    });

    it('deve lançar erro quando produto não existe', async () => {
      await expect(
        produtoService.adicionarEstoque('inexistente', 5)
      ).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('removerEstoque', () => {
    it('deve remover estoque do produto', async () => {
      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 2500
      });

      const produto = await produtoService.removerEstoque('produto1', 3);

      expect(produto?.quantidadeEstoque).toBe(7);
    });

    it('deve lançar erro quando estoque é insuficiente', async () => {
      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 5,
        valorUnitario: 2500
      });

      await expect(
        produtoService.removerEstoque('produto1', 10)
      ).rejects.toThrow('Estoque insuficiente');
    });
  });

  describe('deletar', () => {
    it('deve deletar produto existente', async () => {
      await ProdutoModel.create({
        id: 'produto1',
        nome: 'Notebook',
        quantidadeEstoque: 10,
        valorUnitario: 2500
      });

      const deletado = await produtoService.deletar('produto1');

      expect(deletado).toBe(true);
      const produto = await ProdutoModel.findOne({ id: 'produto1' });
      expect(produto).toBeNull();
    });
  });
});

