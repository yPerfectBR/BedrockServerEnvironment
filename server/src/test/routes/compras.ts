import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ClienteService } from '../services/ClienteService.js';
import { ProdutoService } from '../services/ProdutoService.js';
import { CompraService } from '../services/CompraService.js';
import { IRespostaPadrao, ICompraResultado } from '../types/index.js';

interface RealizarCompraBody {
  clienteId: string;
  produtoId: string;
  quantidade: number;
}

export async function compraRoutes(fastify: FastifyInstance): Promise<void> {
  const clienteService = new ClienteService();
  const produtoService = new ProdutoService();
  const compraService = new CompraService(clienteService, produtoService);

  fastify.post<{ Body: RealizarCompraBody; Reply: IRespostaPadrao<ICompraResultado> }>(
    '/',
    async (request: FastifyRequest<{ Body: RealizarCompraBody }>, reply: FastifyReply) => {
      try {
        const { clienteId, produtoId, quantidade } = request.body;

        if (!clienteId || !produtoId || quantidade === undefined) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Campos obrigatórios: clienteId, produtoId, quantidade',
            erro: 'DADOS_INVALIDOS'
          });
        }

        const resultado = await compraService.realizarCompra(clienteId, produtoId, quantidade);

        if (!resultado.sucesso) {
          const statusCode = resultado.erro === 'CLIENTE_NAO_ENCONTRADO' || 
                           resultado.erro === 'PRODUTO_NAO_ENCONTRADO' ? 404 : 400;
          return reply.status(statusCode).send({
            sucesso: false,
            mensagem: resultado.mensagem,
            erro: resultado.erro
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: resultado,
          mensagem: resultado.mensagem
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

