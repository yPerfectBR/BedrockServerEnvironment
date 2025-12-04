export interface ICliente {
  _id?: string;
  id: string;
  nome: string;
  saldo: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduto {
  _id?: string;
  id: string;
  nome: string;
  quantidadeEstoque: number;
  valorUnitario: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICompra {
  clienteId: string;
  produtoId: string;
  quantidade: number;
  valorTotal: number;
  dataCompra: Date;
}

export interface ICompraResultado {
  sucesso: boolean;
  mensagem: string;
  compra?: ICompra;
  erro?: string;
}

export interface IRespostaPadrao<T = unknown> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erro?: string;
}

