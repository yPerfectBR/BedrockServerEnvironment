// Re-exportar tipos de PlayerData para uso nas rotas
export type { IPlayerData, IInventoryItem } from './PlayerData.js';

/**
 * Interface padrão para respostas da API
 */
export interface IRespostaPadrao<T = unknown> {
  sucesso: boolean;
  dados?: T;
  mensagem?: string;
  erro?: string;
}
