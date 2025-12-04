/**
 * Interfaces e tipos para o sistema de banco de dados
 */

/**
 * Item do inventário do jogador
 */
export interface IInventoryItem {
  typeId: string;
  amount: number;
  slot: number;
}

/**
 * Dados do jogador salvos no banco
 */
export interface IPlayerData {
  id: string;
  nick: string;
  inventory: IInventoryItem[];
}

/**
 * Resposta da API ao salvar dados
 */
export interface ISaveResponse {
  sucesso: boolean;
  mensagem?: string;
  erro?: string;
}

/**
 * Resposta da API ao carregar dados
 */
export interface ILoadResponse {
  sucesso: boolean;
  dados?: IPlayerData;
  mensagem?: string;
  erro?: string;
}

