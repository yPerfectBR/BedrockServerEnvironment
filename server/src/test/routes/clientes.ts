import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ClienteService } from '../services/ClienteService.js';
import { ICliente, IRespostaPadrao } from '../types/index.js';

interface CriarClienteBody {
  id: string;
  nome: string;
  saldo: number;
}

interface AtualizarSaldoBody {
  saldo: number;
}

interface AdicionarSaldoBody {
  valor: number;
}

export async function clienteRoutes(fastify: FastifyInstance): Promise<void> {
  const clienteService = new ClienteService();

  fastify.get<{ Reply: IRespostaPadrao<ICliente[]> }>(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const clientes = await clienteService.buscarTodos();
        return reply.status(200).send({
          sucesso: true,
          dados: clientes
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

  fastify.get<{ Params: { id: string }; Reply: IRespostaPadrao<ICliente> }>(
    '/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const cliente = await clienteService.buscarPorId(id);

        if (!cliente) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Cliente não encontrado',
            erro: 'CLIENTE_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: cliente
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

  fastify.post<{ Body: CriarClienteBody; Reply: IRespostaPadrao<ICliente> }>(
    '/',
    async (request: FastifyRequest<{ Body: CriarClienteBody }>, reply: FastifyReply) => {
      try {
        const { id, nome, saldo } = request.body;

        if (!id || !nome || saldo === undefined) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Campos obrigatórios: id, nome, saldo',
            erro: 'DADOS_INVALIDOS'
          });
        }

        if (saldo < 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Saldo não pode ser negativo',
            erro: 'SALDO_INVALIDO'
          });
        }

        const cliente = await clienteService.criar({ id, nome, saldo });
        return reply.status(201).send({
          sucesso: true,
          dados: cliente,
          mensagem: 'Cliente criado com sucesso'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        if (errorMessage.includes('duplicate key')) {
          return reply.status(409).send({
            sucesso: false,
            mensagem: 'Cliente com este ID já existe',
            erro: 'CLIENTE_DUPLICADO'
          });
        }

        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );

  fastify.put<{ Params: { id: string }; Body: AtualizarSaldoBody; Reply: IRespostaPadrao<ICliente> }>(
    '/:id/saldo',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: AtualizarSaldoBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { saldo } = request.body;

        if (saldo === undefined || saldo < 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Saldo deve ser um número não negativo',
            erro: 'SALDO_INVALIDO'
          });
        }

        const cliente = await clienteService.atualizarSaldo(id, saldo);

        if (!cliente) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Cliente não encontrado',
            erro: 'CLIENTE_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: cliente,
          mensagem: 'Saldo atualizado com sucesso'
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

  fastify.post<{ Params: { id: string }; Body: AdicionarSaldoBody; Reply: IRespostaPadrao<ICliente> }>(
    '/:id/adicionar-saldo',
    async (
      request: FastifyRequest<{ Params: { id: string }; Body: AdicionarSaldoBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { id } = request.params;
        const { valor } = request.body;

        if (valor === undefined || valor <= 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Valor deve ser um número positivo',
            erro: 'VALOR_INVALIDO'
          });
        }

        const cliente = await clienteService.adicionarSaldo(id, valor);

        if (!cliente) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Cliente não encontrado',
            erro: 'CLIENTE_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: cliente,
          mensagem: 'Saldo adicionado com sucesso'
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
        const deletado = await clienteService.deletar(id);

        if (!deletado) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Cliente não encontrado',
            erro: 'CLIENTE_NAO_ENCONTRADO'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          mensagem: 'Cliente deletado com sucesso'
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

