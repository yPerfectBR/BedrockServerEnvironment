import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PlayerDataService } from '../services/PlayerDataService.js';
import { IRespostaPadrao } from '../types/index.js';
import { IPlayerData } from '../types/PlayerData.js';

interface SavePlayerDataBody {
  id: string;
  nick: string;
  inventory: Array<{
    typeId: string;
    amount: number;
    slot: number;
  }>;
}

export async function playerDataRoutes(fastify: FastifyInstance): Promise<void> {
  const playerDataService = new PlayerDataService();

  /**
   * GET /api/playerData/:nick
   * Carrega dados do jogador pelo nick
   */
  fastify.get<{ Params: { nick: string }; Reply: IRespostaPadrao<IPlayerData> }>(
    '/:nick',
    async (request: FastifyRequest<{ Params: { nick: string } }>, reply: FastifyReply) => {
      try {
        const { nick } = request.params;

        if (!nick || nick.trim().length === 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Nick é obrigatório',
            erro: 'NICK_INVALIDO'
          });
        }

        const playerData = await playerDataService.load(nick);

        if (!playerData) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Dados do jogador não encontrados',
            erro: 'NOT_FOUND'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: playerData
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

  /**
   * POST /api/playerData/:nick
   * Salva ou atualiza dados do jogador usando o nick como chave
   */
  fastify.post<{ Params: { nick: string }; Body: SavePlayerDataBody; Reply: IRespostaPadrao<IPlayerData> }>(
    '/:nick',
    async (
      request: FastifyRequest<{ Params: { nick: string }; Body: SavePlayerDataBody }>,
      reply: FastifyReply
    ) => {
      try {
        const { nick } = request.params;
        const body = request.body;

        if (!nick || nick.trim().length === 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Nick é obrigatório',
            erro: 'NICK_INVALIDO'
          });
        }

        if (!body || !body.id || !body.nick || !Array.isArray(body.inventory)) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Dados inválidos. Campos obrigatórios: id, nick, inventory',
            erro: 'DADOS_INVALIDOS'
          });
        }

        const playerData: IPlayerData = {
          id: body.id,
          nick: body.nick,
          inventory: body.inventory
        };

        const savedData = await playerDataService.save(nick, playerData);

        return reply.status(200).send({
          sucesso: true,
          dados: savedData,
          mensagem: 'Dados do jogador salvos com sucesso'
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        
        if (errorMessage.includes('obrigatório') || errorMessage.includes('deve ser')) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: errorMessage,
            erro: 'VALIDACAO_FALHOU'
          });
        }

        return reply.status(500).send({
          sucesso: false,
          erro: errorMessage
        });
      }
    }
  );

  /**
   * DELETE /api/playerData/:nick
   * Deleta dados do jogador
   */
  fastify.delete<{ Params: { nick: string }; Reply: IRespostaPadrao<null> }>(
    '/:nick',
    async (request: FastifyRequest<{ Params: { nick: string } }>, reply: FastifyReply) => {
      try {
        const { nick } = request.params;

        if (!nick || nick.trim().length === 0) {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Nick é obrigatório',
            erro: 'NICK_INVALIDO'
          });
        }

        const deletado = await playerDataService.delete(nick);

        if (!deletado) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Dados do jogador não encontrados',
            erro: 'NOT_FOUND'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          mensagem: 'Dados do jogador deletados com sucesso'
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

  /**
   * GET /api/playerData
   * Lista todos os dados salvos (útil para debug)
   */
  fastify.get<{ Reply: IRespostaPadrao<IPlayerData[]> }>(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const allData = await playerDataService.listAll();
        return reply.status(200).send({
          sucesso: true,
          dados: allData
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

