import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Database } from './config/database.js';
import { playerDataRoutes } from './routes/playerData.js';

const PORT = Number(process.env.PORT) || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/bedrock_db?authSource=admin';

async function iniciarServidor(): Promise<void> {
  const fastify = Fastify({
    logger: true
  });

  await fastify.register(cors, {
    origin: true
  });

  await fastify.register(playerDataRoutes, { prefix: '/api/playerData' });

  fastify.get('/health', async (_request, reply) => {
    const db = Database.getInstance();
    return reply.status(200).send({
      status: 'ok',
      database: db.getConnectionStatus() ? 'conectado' : 'desconectado',
      timestamp: new Date().toISOString()
    });
  });

  // Rota de teste para verificar conectividade do Bedrock server
  fastify.get('/test', async (_request, reply) => {
    return reply.status(200).send({
      sucesso: true,
      mensagem: 'API acessível do Bedrock server!',
      timestamp: new Date().toISOString(),
      origem: 'bedrock-server-api',
      rede: 'bedrock-network'
    });
  });

  try {
    const db = Database.getInstance();
    await db.connect(MONGODB_URI);
    
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
    console.log(`🎮 Player Data: http://localhost:${PORT}/api/playerData`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro ao iniciar servidor:', errorMessage);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n⚠️ Encerrando servidor...');
  const db = Database.getInstance();
  await db.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Encerrando servidor...');
  const db = Database.getInstance();
  await db.disconnect();
  process.exit(0);
});

iniciarServidor().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
  console.error('❌ Erro fatal:', errorMessage);
  process.exit(1);
});

