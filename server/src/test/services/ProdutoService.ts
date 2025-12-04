import { ProdutoModel } from '../models/Produto.js';
import { IProduto } from '../types/index.js';

export class ProdutoService {
  public async criar(produto: Omit<IProduto, '_id' | 'createdAt' | 'updatedAt'>): Promise<IProduto> {
    const novoProduto = new ProdutoModel(produto);
    return await novoProduto.save();
  }

  public async buscarPorId(id: string): Promise<IProduto | null> {
    return await ProdutoModel.findOne({ id }).exec();
  }

  public async buscarTodos(): Promise<IProduto[]> {
    return await ProdutoModel.find().exec();
  }

  public async atualizarEstoque(id: string, novaQuantidade: number): Promise<IProduto | null> {
    if (novaQuantidade < 0) {
      throw new Error('Quantidade em estoque não pode ser negativa');
    }

    return await ProdutoModel.findOneAndUpdate(
      { id },
      { quantidadeEstoque: novaQuantidade },
      { new: true }
    ).exec();
  }

  public async adicionarEstoque(id: string, quantidade: number): Promise<IProduto | null> {
    if (quantidade <= 0) {
      throw new Error('Quantidade a adicionar deve ser positiva');
    }

    const produto = await this.buscarPorId(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    const novaQuantidade = produto.quantidadeEstoque + quantidade;
    return await this.atualizarEstoque(id, novaQuantidade);
  }

  public async removerEstoque(id: string, quantidade: number): Promise<IProduto | null> {
    if (quantidade <= 0) {
      throw new Error('Quantidade a remover deve ser positiva');
    }

    const produto = await this.buscarPorId(id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }

    if (produto.quantidadeEstoque < quantidade) {
      throw new Error('Estoque insuficiente');
    }

    const novaQuantidade = produto.quantidadeEstoque - quantidade;
    return await this.atualizarEstoque(id, novaQuantidade);
  }

  public async deletar(id: string): Promise<boolean> {
    const resultado = await ProdutoModel.deleteOne({ id }).exec();
    return resultado.deletedCount === 1;
  }
}

