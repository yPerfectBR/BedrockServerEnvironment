import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProdutoService } from '../services/ProdutoService.js';
import { IProduto, IRespostaPadrao } from '../types/index.js';

interface CriarProdutoBody {
  id: string;
  nome: string;
  quantidadeEstoque: number;
  valorUnitario: number;
}

interface AtualizarEstoqueBody {
  quantidadeEstoque: number;
}

interface AdicionarEstoqueBody {
  quantidade: number;
}

export async function produtoRoutes(fastify: FastifyInstance): Promise<void> {
  const produtoService = new ProdutoService();

  fastify.get<{ Reply: IRespostaPadrao<IProduto[]> }>(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const produtos = await produtoService.buscarTodos();
        return reply.status(200).send({
          sucesso: true,
          dados: produtos
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );

  fastify.get<{ Params: { id: string }; Reply: IRespostaPadrao<IProduto> }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const produto = await produtoService.buscarPorId(id);

        if (!produto) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Produto não encontrado',
            erro: 'PRODUTO_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: produto
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );

  fastify.post<{ Body: CriarProdutoBody; Reply: IRespostaPadrao<IProduto> }>(
    '/',
    async (request: FastifyRequest<{ Body: CriarProdutoBody }>, reply: FastifyReply) => {
      try {
        const { id, nome, quantidadeEstoque, valorUnitario } = request.body;

        if (!id || !nome || quantidadeEstoque === undefined || valorUnitario === undefined) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Campos obrigatórios: id, nome, quantidadeEstoque, valorUnitario',
            erro: 'DADOS_INVALIDOS'
          });
        }

        if (quantidadeEstoque < 0 || valorUnitario < 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Quantidade e valor não podem ser negativos',
            erro: 'VALORES_INVALIDOS'
          });
        }

        const produto = await produtoService.criar({ id, nome, quantidadeEstoque, valorUnitario });
        return reply.status(201).send({
          sucesso: true,
          dados: produto,
          mensagem: 'Produto criado com sucesso'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        if (errorMessage.includes('duplicate key')) {
          return reply.status(409).send({
            sucesso: false,
            mensagem: 'Produto com este ID já existe',
            erro: 'PRODUTO_DUPLICADO'
          });
        }

        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );

  fastify.put<{ Params: { id: string }; Body: AtualizarEstoqueBody; Reply: IRespostaPadrao<IProduto> }>(
    '/:id/estoque',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: AtualizarEstoqueBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { quantidadeEstoque } = request.body;

        if (quantidadeEstoque === undefined || quantidadeEstoque < 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Quantidade deve ser um número não negativo',
            erro: 'QUANTIDADE_INVALIDA'
          });
        }

        const produto = await produtoService.atualizarEstoque(id, quantidadeEstoque);

        if (!produto) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Produto não encontrado',
            erro: 'PRODUTO_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: produto,
          mensagem: 'Estoque atualizado com sucesso'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );

  fastify.post<{ Params: { id: string }; Body: AdicionarEstoqueBody; Reply: IRespostaPadrao<IProduto> }>(
    '/:id/adicionar-estoque',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: AdicionarEstoqueBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { quantidade } = request.body;

        if (quantidade === undefined || quantidade <= 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Quantidade deve ser um número positivo',
            erro: 'QUANTIDADE_INVALIDA'
          });
        }

        const produto = await produtoService.adicionarEstoque(id, quantidade);

        if (!produto) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Produto não encontrado',
            erro: 'PRODUTO_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: produto,
          mensagem: 'Estoque adicionado com sucesso'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );

  fastify.delete<{ Params: { id: string }; Reply: IRespostaPadrao<null> }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const deletado = await produtoService.deletar(id);

        if (!deletado) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Produto não encontrado',
            erro: 'PRODUTO_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          mensagem: 'Produto deletado com sucesso'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );
}

