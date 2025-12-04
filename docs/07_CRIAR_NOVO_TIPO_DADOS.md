# 📊 Como Criar um Novo Tipo de Dados

Este guia mostra como criar um novo tipo de dados para salvar no banco de dados, desde o código no addon até as rotas, serviços e modelos na API.

## 📋 Visão Geral

O processo envolve 5 etapas principais:

1. **Addon - Tipos TypeScript** - Definir interfaces no addon
2. **Addon - Classe Database** - Criar classe para gerenciar o novo tipo
3. **Addon - Lógica de Uso** - Implementar a lógica no addon
4. **API - Tipos e Modelo** - Criar tipos e modelo Mongoose na API
5. **API - Serviço e Rotas** - Criar serviço e rotas REST

## 🎯 Exemplo: PlayerStats (Estatísticas do Jogador)

Vamos criar um sistema para salvar estatísticas do jogador (nível, experiência, mortes, kills, etc.).

---

## Etapa 1: Addon - Definir Tipos TypeScript

**Arquivo:** `development/scripts/types/Database.ts`

Adicione a interface do novo tipo de dados:

```typescript
// Interface para estatísticas do jogador
export interface IPlayerStats {
  id: string;              // ID único do jogador
  nick: string;            // Nome do jogador
  level: number;           // Nível do jogador
  experience: number;       // Experiência atual
  totalKills: number;      // Total de kills
  totalDeaths: number;     // Total de mortes
  playTime: number;        // Tempo de jogo em minutos
  lastUpdated: Date;        // Data da última atualização
}

// Interface de resposta ao salvar
export interface IStatsSaveResponse {
  sucesso: boolean;
  mensagem?: string;
  erro?: string;
}

// Interface de resposta ao carregar
export interface IStatsLoadResponse {
  sucesso: boolean;
  dados?: IPlayerStats;
  mensagem?: string;
  erro?: string;
}
```

---

## Etapa 2: Addon - Criar Classe Database

**Arquivo:** `development/scripts/database/StatsDatabase.ts`

Crie uma nova classe Database específica para o novo tipo:

```typescript
import { http, HttpRequest, HttpRequestMethod, HttpResponse } from "@minecraft/server-net";
import { IPlayerStats, IStatsSaveResponse, IStatsLoadResponse } from "../types/Database.js";

/**
 * Classe StatsDatabase para gerenciar estatísticas de jogadores via HTTP
 */
export class StatsDatabase {
  private readonly collectionName: string;
  private readonly apiUrl: string;

  private static readonly HTTP_METHOD_POST = HttpRequestMethod.Post;
  private static readonly HTTP_METHOD_GET = HttpRequestMethod.Get;

  constructor(collectionName: string = "playerStats", apiUrl: string = "http://api:3000") {
    this.collectionName = collectionName;
    this.apiUrl = apiUrl;
  }

  /**
   * Valida os dados de estatísticas antes de salvar
   */
  private validateStatsData(data: IPlayerStats): { valid: boolean; error?: string } {
    if (!data?.id || typeof data.id !== "string" || data.id.trim().length === 0) {
      return { valid: false, error: "ID do jogador é obrigatório" };
    }

    if (!data?.nick || typeof data.nick !== "string" || data.nick.trim().length === 0) {
      return { valid: false, error: "Nick do jogador é obrigatório" };
    }

    if (typeof data.level !== "number" || data.level < 0 || !Number.isInteger(data.level)) {
      return { valid: false, error: "Level deve ser um número inteiro não negativo" };
    }

    if (typeof data.experience !== "number" || data.experience < 0) {
      return { valid: false, error: "Experience deve ser um número não negativo" };
    }

    if (typeof data.totalKills !== "number" || data.totalKills < 0 || !Number.isInteger(data.totalKills)) {
      return { valid: false, error: "TotalKills deve ser um número inteiro não negativo" };
    }

    if (typeof data.totalDeaths !== "number" || data.totalDeaths < 0 || !Number.isInteger(data.totalDeaths)) {
      return { valid: false, error: "TotalDeaths deve ser um número inteiro não negativo" };
    }

    if (typeof data.playTime !== "number" || data.playTime < 0) {
      return { valid: false, error: "PlayTime deve ser um número não negativo" };
    }

    return { valid: true };
  }

  /**
   * Cria e configura uma requisição HTTP
   */
  private createRequest(url: string, method: HttpRequestMethod, body?: string): HttpRequest {
    const request = new HttpRequest(url);
    request.method = method;
    request.addHeader("Content-Type", "application/json");
    
    if (body) {
      request.setBody(body);
    }
    
    return request;
  }

  /**
   * Processa a resposta HTTP
   */
  private parseResponse<T>(response: HttpResponse): T {
    try {
      return JSON.parse(response.body as string) as T;
    } catch {
      throw new Error("Resposta da API não é um JSON válido");
    }
  }

  /**
   * Valida uma chave (nome do jogador)
   */
  private validateKey(key: string): { valid: boolean; error?: string } {
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return { valid: false, error: "Chave inválida. Deve ser uma string não vazia." };
    }
    return { valid: true };
  }

  /**
   * Salva estatísticas do jogador no banco de dados
   */
  async save(key: string, data: IPlayerStats): Promise<IStatsSaveResponse> {
    const keyValidation = this.validateKey(key);
    if (!keyValidation.valid) {
      return {
        sucesso: false,
        erro: "INVALID_KEY",
        mensagem: keyValidation.error
      };
    }

    const dataValidation = this.validateStatsData(data);
    if (!dataValidation.valid) {
      return {
        sucesso: false,
        erro: "INVALID_DATA",
        mensagem: dataValidation.error
      };
    }

    try {
      const url = `${this.apiUrl}/api/${this.collectionName}/${encodeURIComponent(key.trim())}`;
      const request = this.createRequest(url, StatsDatabase.HTTP_METHOD_POST, JSON.stringify(data));
      const response = await http.request(request);

      if (response.status >= 200 && response.status < 300) {
        const responseData = this.parseResponse<IStatsSaveResponse>(response);
        return {
          sucesso: true,
          mensagem: responseData.mensagem || "Estatísticas salvas com sucesso"
        };
      }

      const errorData = this.parseResponse<IStatsSaveResponse>(response);
      return {
        sucesso: false,
        erro: errorData.erro || "UNKNOWN_ERROR",
        mensagem: errorData.mensagem || `Erro ao salvar: Status ${response.status}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        sucesso: false,
        erro: "NETWORK_ERROR",
        mensagem: `Erro de rede: ${errorMessage}`
      };
    }
  }

  /**
   * Carrega estatísticas do jogador do banco de dados
   */
  async load(key: string): Promise<IStatsLoadResponse> {
    const keyValidation = this.validateKey(key);
    if (!keyValidation.valid) {
      return {
        sucesso: false,
        erro: "INVALID_KEY",
        mensagem: keyValidation.error
      };
    }

    try {
      const url = `${this.apiUrl}/api/${this.collectionName}/${encodeURIComponent(key.trim())}`;
      const request = this.createRequest(url, StatsDatabase.HTTP_METHOD_GET);
      const response = await http.request(request);

      if (response.status === 404) {
        return {
          sucesso: false,
          erro: "NOT_FOUND",
          mensagem: "Estatísticas não encontradas"
        };
      }

      if (response.status >= 200 && response.status < 300) {
        const responseData = this.parseResponse<{ sucesso: boolean; dados?: IPlayerStats }>(response);
        
        if (!responseData.sucesso || !responseData.dados) {
          return {
            sucesso: false,
            erro: "INVALID_RESPONSE",
            mensagem: "Resposta inválida da API"
          };
        }

        const validation = this.validateStatsData(responseData.dados);
        if (!validation.valid) {
          return {
            sucesso: false,
            erro: "INVALID_DATA",
            mensagem: `Dados inválidos recebidos: ${validation.error}`
          };
        }

        return {
          sucesso: true,
          dados: responseData.dados
        };
      }

      const errorData = this.parseResponse<IStatsLoadResponse>(response);
      return {
        sucesso: false,
        erro: errorData.erro || "UNKNOWN_ERROR",
        mensagem: errorData.mensagem || `Erro ao carregar: Status ${response.status}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        sucesso: false,
        erro: "NETWORK_ERROR",
        mensagem: `Erro de rede: ${errorMessage}`
      };
    }
  }
}
```

---

## Etapa 3: Addon - Implementar Lógica de Uso

**Arquivo:** `development/scripts/main.ts` (ou criar um novo arquivo)

Adicione a lógica para usar o novo tipo de dados:

```typescript
import { world, Player, EntityDieAfterEvent } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { StatsDatabase } from "./database/StatsDatabase.js";
import { IPlayerStats } from "./types/Database.js";

// Inicializar o database de estatísticas
const statsDb = new StatsDatabase("playerStats", "http://api:3000");

// Armazenar tempo de início da sessão
const sessionStartTime = new Map<string, number>();

/**
 * Inicializa estatísticas para um novo jogador
 */
function initializePlayerStats(player: Player): IPlayerStats {
  return {
    id: player.id,
    nick: player.name,
    level: 1,
    experience: 0,
    totalKills: 0,
    totalDeaths: 0,
    playTime: 0,
    lastUpdated: new Date()
  };
}

/**
 * Salva estatísticas do jogador
 */
async function savePlayerStats(player: Player): Promise<void> {
  // Calcular tempo de jogo da sessão atual
  const startTime = sessionStartTime.get(player.id) || Date.now();
  const sessionTime = (Date.now() - startTime) / 1000 / 60; // em minutos

  // Carregar estatísticas existentes ou criar novas
  const loadResult = await statsDb.load(player.name);
  let stats: IPlayerStats;

  if (loadResult.sucesso && loadResult.dados) {
    stats = {
      ...loadResult.dados,
      playTime: loadResult.dados.playTime + sessionTime,
      lastUpdated: new Date()
    };
  } else {
    stats = initializePlayerStats(player);
    stats.playTime = sessionTime;
  }

  // Salvar no banco de dados
  const result = await statsDb.save(player.name, stats);
  
  if (result.sucesso) {
    player.sendMessage(`§aEstatísticas salvas! Nível: ${stats.level}, Kills: ${stats.totalKills}`);
  } else {
    player.sendMessage(`§cErro ao salvar: ${result.mensagem}`);
  }
}

/**
 * Carrega e exibe estatísticas do jogador
 */
async function loadPlayerStats(player: Player): Promise<void> {
  const result = await statsDb.load(player.name);
  
  if (result.sucesso && result.dados) {
    const stats = result.dados;
    player.sendMessage(`§e=== Estatísticas ===`);
    player.sendMessage(`§7Nível: §f${stats.level}`);
    player.sendMessage(`§7Experiência: §f${stats.experience}`);
    player.sendMessage(`§7Kills: §f${stats.totalKills}`);
    player.sendMessage(`§7Mortes: §f${stats.totalDeaths}`);
    player.sendMessage(`§7Tempo de jogo: §f${Math.floor(stats.playTime)} minutos`);
  } else {
    player.sendMessage("§cEstatísticas não encontradas. Use um item para criar.");
  }
}

/**
 * Incrementa kills quando o jogador mata uma entidade
 */
world.afterEvents.entityDie.subscribe(async (event: EntityDieAfterEvent) => {
  const { deadEntity, damageSource } = event;
  
  // Verificar se foi um jogador que matou
  if (damageSource.damagingEntity?.typeId === "minecraft:player") {
    const killer = damageSource.damagingEntity as Player;
    
    // Carregar estatísticas
    const loadResult = await statsDb.load(killer.name);
    let stats: IPlayerStats;

    if (loadResult.sucesso && loadResult.dados) {
      stats = {
        ...loadResult.dados,
        totalKills: loadResult.dados.totalKills + 1,
        experience: loadResult.dados.experience + 10, // Ganha 10 XP por kill
        lastUpdated: new Date()
      };
    } else {
      stats = initializePlayerStats(killer);
      stats.totalKills = 1;
      stats.experience = 10;
    }

    // Salvar estatísticas atualizadas
    await statsDb.save(killer.name, stats);
  }
});

/**
 * Incrementa mortes quando o jogador morre
 */
world.afterEvents.entityDie.subscribe(async (event: EntityDieAfterEvent) => {
  const { deadEntity } = event;
  
  if (deadEntity.typeId === "minecraft:player") {
    const player = deadEntity as Player;
    
    // Carregar estatísticas
    const loadResult = await statsDb.load(player.name);
    let stats: IPlayerStats;

    if (loadResult.sucesso && loadResult.dados) {
      stats = {
        ...loadResult.dados,
        totalDeaths: loadResult.dados.totalDeaths + 1,
        lastUpdated: new Date()
      };
    } else {
      stats = initializePlayerStats(player);
      stats.totalDeaths = 1;
    }

    // Salvar estatísticas atualizadas
    await statsDb.save(player.name, stats);
  }
});

/**
 * Registrar tempo de início da sessão quando o jogador entra
 */
world.afterEvents.playerSpawn.subscribe((event) => {
  if (event.initialSpawn) {
    const player = event.player;
    sessionStartTime.set(player.id, Date.now());
  }
});

/**
 * Salvar estatísticas quando o jogador sai
 */
world.afterEvents.playerLeave.subscribe(async (event) => {
  const player = event.playerId;
  const playerEntity = world.getPlayers().find(p => p.id === player);
  
  if (playerEntity) {
    await savePlayerStats(playerEntity);
    sessionStartTime.delete(player);
  }
});

/**
 * Usar item para salvar/carregar estatísticas
 */
world.afterEvents.itemUse.subscribe(async (event) => {
  const { itemStack, source: player } = event;
  
  if (itemStack.typeId === MinecraftItemTypes.Book) {
    // Livro = Salvar estatísticas
    await savePlayerStats(player);
  } else if (itemStack.typeId === MinecraftItemTypes.Paper) {
    // Papel = Carregar e exibir estatísticas
    await loadPlayerStats(player);
  }
});
```

---

## Etapa 4: API - Criar Tipos e Modelo

### 4.1 Criar Interface TypeScript

**Arquivo:** `server/src/types/PlayerStats.ts`

```typescript
export interface IPlayerStats {
  _id?: string;
  id: string;
  nick: string;
  level: number;
  experience: number;
  totalKills: number;
  totalDeaths: number;
  playTime: number;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### 4.2 Criar Modelo Mongoose

**Arquivo:** `server/src/models/PlayerStats.ts`

```typescript
import mongoose, { Schema, Model } from 'mongoose';
import { IPlayerStats } from '../types/PlayerStats.js';

const playerStatsSchema = new Schema<IPlayerStats>(
  {
    id: {
      type: String,
      required: true,
      index: true
    },
    nick: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      default: 1
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalKills: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalDeaths: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    playTime: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'player_stats'
  }
);

// Índice composto para busca rápida por nick
playerStatsSchema.index({ nick: 1 }, { unique: true });

export const PlayerStatsModel: Model<IPlayerStats> = mongoose.model<IPlayerStats>(
  'PlayerStats',
  playerStatsSchema
);
```

---

## Etapa 5: API - Criar Serviço e Rotas

### 5.1 Criar Serviço

**Arquivo:** `server/src/services/PlayerStatsService.ts`

```typescript
import { PlayerStatsModel } from '../models/PlayerStats.js';
import { IPlayerStats } from '../types/PlayerStats.js';

export class PlayerStatsService {
  /**
   * Valida os dados de estatísticas
   */
  private validateStatsData(data: IPlayerStats): { valid: boolean; error?: string } {
    if (!data.id || typeof data.id !== 'string' || data.id.trim().length === 0) {
      return { valid: false, error: 'ID do jogador é obrigatório e deve ser uma string não vazia' };
    }

    if (!data.nick || typeof data.nick !== 'string' || data.nick.trim().length === 0) {
      return { valid: false, error: 'Nick do jogador é obrigatório e deve ser uma string não vazia' };
    }

    if (typeof data.level !== 'number' || data.level < 0 || !Number.isInteger(data.level)) {
      return { valid: false, error: 'Level deve ser um número inteiro não negativo' };
    }

    if (typeof data.experience !== 'number' || data.experience < 0) {
      return { valid: false, error: 'Experience deve ser um número não negativo' };
    }

    if (typeof data.totalKills !== 'number' || data.totalKills < 0 || !Number.isInteger(data.totalKills)) {
      return { valid: false, error: 'TotalKills deve ser um número inteiro não negativo' };
    }

    if (typeof data.totalDeaths !== 'number' || data.totalDeaths < 0 || !Number.isInteger(data.totalDeaths)) {
      return { valid: false, error: 'TotalDeaths deve ser um número inteiro não negativo' };
    }

    if (typeof data.playTime !== 'number' || data.playTime < 0) {
      return { valid: false, error: 'PlayTime deve ser um número não negativo' };
    }

    return { valid: true };
  }

  /**
   * Salva ou atualiza estatísticas do jogador usando o nick como chave
   */
  public async save(nick: string, data: IPlayerStats): Promise<IPlayerStats> {
    const validation = this.validateStatsData(data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Garante que o nick nos dados corresponde à chave
    const dataToSave = {
      ...data,
      nick: nick.trim(),
      lastUpdated: new Date()
    };

    return await PlayerStatsModel.findOneAndUpdate(
      { nick: nick.trim() },
      dataToSave,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();
  }

  /**
   * Carrega estatísticas do jogador pelo nick
   */
  public async load(nick: string): Promise<IPlayerStats | null> {
    return await PlayerStatsModel.findOne({ nick: nick.trim() }).exec();
  }

  /**
   * Deleta estatísticas do jogador pelo nick
   */
  public async delete(nick: string): Promise<boolean> {
    const result = await PlayerStatsModel.deleteOne({ nick: nick.trim() }).exec();
    return result.deletedCount === 1;
  }

  /**
   * Lista todas as estatísticas salvas
   */
  public async listAll(): Promise<IPlayerStats[]> {
    return await PlayerStatsModel.find().exec();
  }
}
```

### 5.2 Criar Rotas

**Arquivo:** `server/src/routes/playerStats.ts`

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PlayerStatsService } from '../services/PlayerStatsService.js';
import { IRespostaPadrao } from '../types/index.js';
import { IPlayerStats } from '../types/PlayerStats.js';

interface SavePlayerStatsBody {
  id: string;
  nick: string;
  level: number;
  experience: number;
  totalKills: number;
  totalDeaths: number;
  playTime: number;
  lastUpdated: Date;
}

export async function playerStatsRoutes(fastify: FastifyInstance): Promise<void> {
  const playerStatsService = new PlayerStatsService();

  /**
   * GET /api/playerStats/:nick
   * Carrega estatísticas do jogador pelo nick
   */
  fastify.get<{ Params: { nick: string }; Reply: IRespostaPadrao<IPlayerStats> }>(
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

        const stats = await playerStatsService.load(nick);

        if (!stats) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Estatísticas do jogador não encontradas',
            erro: 'NOT_FOUND'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          dados: stats
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
   * POST /api/playerStats/:nick
   * Salva ou atualiza estatísticas do jogador usando o nick como chave
   */
  fastify.post<{ Params: { nick: string }; Body: SavePlayerStatsBody; Reply: IRespostaPadrao<IPlayerStats> }>(
    '/:nick',
    async (
      request: FastifyRequest<{ Params: { nick: string }; Body: SavePlayerStatsBody }>,
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

        if (!body || !body.id || !body.nick || typeof body.level !== 'number') {
          return reply.status(400).send({
            sucesso: false,
            mensagem: 'Dados inválidos. Campos obrigatórios: id, nick, level, experience, totalKills, totalDeaths, playTime',
            erro: 'DADOS_INVALIDOS'
          });
        }

        const stats: IPlayerStats = {
          id: body.id,
          nick: body.nick,
          level: body.level,
          experience: body.experience,
          totalKills: body.totalKills,
          totalDeaths: body.totalDeaths,
          playTime: body.playTime,
          lastUpdated: body.lastUpdated || new Date()
        };

        const savedStats = await playerStatsService.save(nick, stats);

        return reply.status(200).send({
          sucesso: true,
          dados: savedStats,
          mensagem: 'Estatísticas do jogador salvas com sucesso'
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
   * DELETE /api/playerStats/:nick
   * Deleta estatísticas do jogador
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

        const deletado = await playerStatsService.delete(nick);

        if (!deletado) {
          return reply.status(404).send({
            sucesso: false,
            mensagem: 'Estatísticas do jogador não encontradas',
            erro: 'NOT_FOUND'
          });
        }

        return reply.status(200).send({
          sucesso: true,
          mensagem: 'Estatísticas do jogador deletadas com sucesso'
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
   * GET /api/playerStats
   * Lista todas as estatísticas salvas (útil para debug)
   */
  fastify.get<{ Reply: IRespostaPadrao<IPlayerStats[]> }>(
    '/',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      try {
        const allStats = await playerStatsService.listAll();
        return reply.status(200).send({
          sucesso: true,
          dados: allStats
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
```

### 5.3 Registrar Rotas no index.ts

**Arquivo:** `server/src/index.ts`

Adicione o import e registro das rotas:

```typescript
import { playerStatsRoutes } from './routes/playerStats.js';

// ... dentro da função iniciarServidor ...

await fastify.register(playerStatsRoutes, { prefix: '/api/playerStats' });
```

---

## ✅ Resumo dos Arquivos Criados/Modificados

### Addon (development/)
- ✅ `scripts/types/Database.ts` - Adicionar interfaces
- ✅ `scripts/database/StatsDatabase.ts` - Nova classe Database
- ✅ `scripts/main.ts` - Adicionar lógica de uso

### API (server/)
- ✅ `src/types/PlayerStats.ts` - Interface TypeScript
- ✅ `src/models/PlayerStats.ts` - Modelo Mongoose
- ✅ `src/services/PlayerStatsService.ts` - Serviço de negócio
- ✅ `src/routes/playerStats.ts` - Rotas REST
- ✅ `src/index.ts` - Registrar rotas

---

## 🧪 Testando

### 1. Compilar o Addon

```bash
cd development
npm run build
npm run local-deploy
```

### 2. Reiniciar o Servidor

```bash
docker compose restart bedrock-server
```

### 3. Testar no Jogo

- Use um **Livro** para salvar estatísticas
- Use **Papel** para carregar e exibir estatísticas
- Mate entidades para incrementar kills
- Morra para incrementar mortes

### 4. Testar a API

```bash
# Carregar estatísticas
curl http://localhost:3000/api/playerStats/SeuNick

# Salvar estatísticas
curl -X POST http://localhost:3000/api/playerStats/SeuNick \
  -H "Content-Type: application/json" \
  -d '{
    "id": "player-id",
    "nick": "SeuNick",
    "level": 5,
    "experience": 100,
    "totalKills": 10,
    "totalDeaths": 2,
    "playTime": 60,
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }'
```

---

## 💡 Dicas

1. **Validação**: Sempre valide os dados tanto no addon quanto na API
2. **Nomes Consistentes**: Use o mesmo nome de coleção no addon e na API
3. **Tratamento de Erros**: Implemente tratamento de erros robusto
4. **Tipos TypeScript**: Mantenha os tipos sincronizados entre addon e API
5. **Índices**: Adicione índices no modelo Mongoose para melhor performance

---

## 🔄 Próximos Passos

Após criar o novo tipo de dados, você pode:

- Adicionar mais campos conforme necessário
- Criar endpoints adicionais (ex: ranking, top players)
- Implementar cache para melhor performance
- Adicionar testes unitários e de integração

