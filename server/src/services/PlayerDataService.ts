import { PlayerDataModel } from '../models/PlayerData.js';
import { IPlayerData } from '../types/PlayerData.js';

export class PlayerDataService {
  /**
   * Valida os dados do jogador
   */
  private validatePlayerData(data: IPlayerData): { valid: boolean; error?: string } {
    if (!data.id || typeof data.id !== 'string' || data.id.trim().length === 0) {
      return { valid: false, error: 'ID do jogador é obrigatório e deve ser uma string não vazia' };
    }

    if (!data.nick || typeof data.nick !== 'string' || data.nick.trim().length === 0) {
      return { valid: false, error: 'Nick do jogador é obrigatório e deve ser uma string não vazia' };
    }

    if (!Array.isArray(data.inventory)) {
      return { valid: false, error: 'Inventário deve ser um array' };
    }

    for (const item of data.inventory) {
      if (!item.typeId || typeof item.typeId !== 'string' || item.typeId.trim().length === 0) {
        return { valid: false, error: 'Item typeId é obrigatório e deve ser uma string não vazia' };
      }

      if (typeof item.amount !== 'number' || item.amount < 0 || !Number.isInteger(item.amount)) {
        return { valid: false, error: 'Item amount deve ser um número inteiro não negativo' };
      }

      if (typeof item.slot !== 'number' || item.slot < 0 || !Number.isInteger(item.slot)) {
        return { valid: false, error: 'Item slot deve ser um número inteiro não negativo' };
      }
    }

    return { valid: true };
  }

  /**
   * Salva ou atualiza dados do jogador usando o nick como chave
   */
  public async save(nick: string, data: IPlayerData): Promise<IPlayerData> {
    const validation = this.validatePlayerData(data);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Garante que o nick nos dados corresponde à chave
    const dataToSave = {
      ...data,
      nick: nick.trim()
    };

    return await PlayerDataModel.findOneAndUpdate(
      { nick: nick.trim() },
      dataToSave,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();
  }

  /**
   * Carrega dados do jogador pelo nick
   */
  public async load(nick: string): Promise<IPlayerData | null> {
    return await PlayerDataModel.findOne({ nick: nick.trim() }).exec();
  }

  /**
   * Deleta dados do jogador pelo nick
   */
  public async delete(nick: string): Promise<boolean> {
    const result = await PlayerDataModel.deleteOne({ nick: nick.trim() }).exec();
    return result.deletedCount === 1;
  }

  /**
   * Lista todos os dados salvos
   */
  public async listAll(): Promise<IPlayerData[]> {
    return await PlayerDataModel.find().exec();
  }
}

