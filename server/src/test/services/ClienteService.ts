import { ClienteModel } from '../models/Cliente.js';
import { ICliente } from '../types/index.js';

export class ClienteService {
  public async criar(cliente: Omit<ICliente, '_id' | 'createdAt' | 'updatedAt'>): Promise<ICliente> {
    const novoCliente = new ClienteModel(cliente);
    return await novoCliente.save();
  }

  public async buscarPorId(id: string): Promise<ICliente | null> {
    return await ClienteModel.findOne({ id }).exec();
  }

  public async buscarTodos(): Promise<ICliente[]> {
    return await ClienteModel.find().exec();
  }

  public async atualizarSaldo(id: string, novoSaldo: number): Promise<ICliente | null> {
    if (novoSaldo < 0) {
      throw new Error('Saldo não pode ser negativo');
    }

    return await ClienteModel.findOneAndUpdate(
      { id },
      { saldo: novoSaldo },
      { new: true }
    ).exec();
  }

  public async adicionarSaldo(id: string, valor: number): Promise<ICliente | null> {
    if (valor <= 0) {
      throw new Error('Valor a adicionar deve ser positivo');
    }

    const cliente = await this.buscarPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    const novoSaldo = cliente.saldo + valor;
    return await this.atualizarSaldo(id, novoSaldo);
  }

  public async debitarSaldo(id: string, valor: number): Promise<ICliente | null> {
    if (valor <= 0) {
      throw new Error('Valor a debitar deve ser positivo');
    }

    const cliente = await this.buscarPorId(id);
    if (!cliente) {
      throw new Error('Cliente não encontrado');
    }

    if (cliente.saldo < valor) {
      throw new Error('Saldo insuficiente');
    }

    const novoSaldo = cliente.saldo - valor;
    return await this.atualizarSaldo(id, novoSaldo);
  }

  public async deletar(id: string): Promise<boolean> {
    const resultado = await ClienteModel.deleteOne({ id }).exec();
    return resultado.deletedCount === 1;
  }
}

