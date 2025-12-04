import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ClienteService } from '../../src/services/ClienteService.js';
import { ClienteModel } from '../../src/models/Cliente.js';

describe('ClienteService', () => {
  let mongoServer: MongoMemoryServer;
  let clienteService: ClienteService;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    clienteService = new ClienteService();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('criar', () => {
    it('deve criar um cliente com sucesso', async () => {
      const cliente = await clienteService.criar({
        id: 'cliente1',
        nome: 'João Silva',
        saldo: 100.0
      });

      expect(cliente).toBeDefined();
      expect(cliente.id).toBe('cliente1');
      expect(cliente.nome).toBe('João Silva');
      expect(cliente.saldo).toBe(100.0);
    });

    it('deve criar cliente com saldo zero', async () => {
      const cliente = await clienteService.criar({
        id: 'cliente2',
        nome: 'Maria Santos',
        saldo: 0
      });

      expect(cliente.saldo).toBe(0);
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar cliente quando encontrado', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João Silva',
        saldo: 100.0
      });

      const cliente = await clienteService.buscarPorId('cliente1');

      expect(cliente).not.toBeNull();
      expect(cliente?.id).toBe('cliente1');
      expect(cliente?.nome).toBe('João Silva');
    });

    it('deve retornar null quando cliente não encontrado', async () => {
      const cliente = await clienteService.buscarPorId('inexistente');
      expect(cliente).toBeNull();
    });
  });

  describe('buscarTodos', () => {
    it('deve retornar todos os clientes', async () => {
      await ClienteModel.create([
        { id: 'cliente1', nome: 'João', saldo: 100 },
        { id: 'cliente2', nome: 'Maria', saldo: 200 }
      ]);

      const clientes = await clienteService.buscarTodos();

      expect(clientes).toHaveLength(2);
    });

    it('deve retornar array vazio quando não há clientes', async () => {
      const clientes = await clienteService.buscarTodos();
      expect(clientes).toHaveLength(0);
    });
  });

  describe('atualizarSaldo', () => {
    it('deve atualizar saldo do cliente', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 100
      });

      const cliente = await clienteService.atualizarSaldo('cliente1', 250);

      expect(cliente).not.toBeNull();
      expect(cliente?.saldo).toBe(250);
    });

    it('deve lançar erro quando saldo é negativo', async () => {
      await expect(
        clienteService.atualizarSaldo('cliente1', -10)
      ).rejects.toThrow('Saldo não pode ser negativo');
    });
  });

  describe('adicionarSaldo', () => {
    it('deve adicionar saldo ao cliente', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 100
      });

      const cliente = await clienteService.adicionarSaldo('cliente1', 50);

      expect(cliente?.saldo).toBe(150);
    });

    it('deve lançar erro quando valor é negativo ou zero', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 100
      });

      await expect(
        clienteService.adicionarSaldo('cliente1', -10)
      ).rejects.toThrow('Valor a adicionar deve ser positivo');

      await expect(
        clienteService.adicionarSaldo('cliente1', 0)
      ).rejects.toThrow('Valor a adicionar deve ser positivo');
    });

    it('deve lançar erro quando cliente não existe', async () => {
      await expect(
        clienteService.adicionarSaldo('inexistente', 50)
      ).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('debitarSaldo', () => {
    it('deve debitar saldo do cliente', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 100
      });

      const cliente = await clienteService.debitarSaldo('cliente1', 30);

      expect(cliente?.saldo).toBe(70);
    });

    it('deve lançar erro quando saldo é insuficiente', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 50
      });

      await expect(
        clienteService.debitarSaldo('cliente1', 100)
      ).rejects.toThrow('Saldo insuficiente');
    });

    it('deve lançar erro quando valor é negativo ou zero', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 100
      });

      await expect(
        clienteService.debitarSaldo('cliente1', -10)
      ).rejects.toThrow('Valor a debitar deve ser positivo');
    });
  });

  describe('deletar', () => {
    it('deve deletar cliente existente', async () => {
      await ClienteModel.create({
        id: 'cliente1',
        nome: 'João',
        saldo: 100
      });

      const deletado = await clienteService.deletar('cliente1');

      expect(deletado).toBe(true);
      const cliente = await ClienteModel.findOne({ id: 'cliente1' });
      expect(cliente).toBeNull();
    });

    it('deve retornar false quando cliente não existe', async () => {
      const deletado = await clienteService.deletar('inexistente');
      expect(deletado).toBe(false);
    });
  });
});

