import { ClienteService } from './ClienteService.js';
import { ProdutoService } from './ProdutoService.js';
import { ICompra, ICompraResultado } from '../types/index.js';

export class CompraService {
  private clienteService: ClienteService;
  private produtoService: ProdutoService;

  constructor(clienteService: ClienteService, produtoService: ProdutoService) {
    this.clienteService = clienteService;
    this.produtoService = produtoService;
  }

  public async realizarCompra(
    clienteId: string,
    produtoId: string,
    quantidade: number
  ): Promise<ICompraResultado> {
    if (quantidade <= 0) {
      return {
        sucesso: false,
        mensagem: 'Quantidade deve ser maior que zero',
        erro: 'QUANTIDADE_INVALIDA'
      };
    }

    try {
      const cliente = await this.clienteService.buscarPorId(clienteId);
      if (!cliente) {
        return {
          sucesso: false,
          mensagem: 'Cliente não encontrado',
          erro: 'CLIENTE_NAO_ENCONTRADO'
        };
      }

      const produto = await this.produtoService.buscarPorId(produtoId);
      if (!produto) {
        return {
          sucesso: false,
          mensagem: 'Produto não encontrado',
          erro: 'PRODUTO_NAO_ENCONTRADO'
        };
      }

      if (produto.quantidadeEstoque < quantidade) {
        return {
          sucesso: false,
          mensagem: 'Estoque insuficiente',
          erro: 'ESTOQUE_INSUFICIENTE'
        };
      }

      const valorTotal = produto.valorUnitario * quantidade;

      if (cliente.saldo < valorTotal) {
        return {
          sucesso: false,
          mensagem: 'Saldo insuficiente',
          erro: 'SALDO_INSUFICIENTE'
        };
      }

      await this.clienteService.debitarSaldo(clienteId, valorTotal);
      await this.produtoService.removerEstoque(produtoId, quantidade);

      const compra: ICompra = {
        clienteId,
        produtoId,
        quantidade,
        valorTotal,
        dataCompra: new Date()
      };

      return {
        sucesso: true,
        mensagem: 'Compra realizada com sucesso',
        compra
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      return {
        sucesso: false,
        mensagem: `Erro ao realizar compra: ${errorMessage}`,
        erro: 'ERRO_INTERNO'
      };
    }
  }
}

