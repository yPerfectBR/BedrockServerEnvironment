import type { Player } from "@minecraft/server";
import { Config } from "../constants/Config.js";
import { Messages } from "../constants/Messages.js";
import { Database } from "../database/Database.js";
import type { IPlayerData } from "../types/Database.js";
import { InventoryUtils } from "../utils/InventoryUtils.js";

export class PlayerInventoryService {
  private readonly database = new Database(Config.COLLECTION_NAME, Config.API_URL);

  async save(player: Player): Promise<void> {
    const inventory = InventoryUtils.getInventoryAsArray(player);
    const playerData: IPlayerData = {
      id: player.id,
      nick: player.name,
      inventory,
    };

    player.sendMessage(Messages.SAVING);

    const result = await this.database.save(player.name, playerData);
    if (result.sucesso) {
      player.sendMessage(Messages.SAVE_SUCCESS(inventory.length));
      return;
    }

    player.sendMessage(Messages.SAVE_ERROR(result.mensagem || result.erro || "Erro desconhecido"));
  }

  async load(player: Player): Promise<void> {
    player.sendMessage(Messages.LOADING);

    const result = await this.database.load(player.name);
    if (result.sucesso && result.dados) {
      InventoryUtils.restoreInventory(player, result.dados.inventory);
      player.sendMessage(Messages.LOAD_SUCCESS(result.dados.inventory.length));
      return;
    }

    if (result.erro === "NOT_FOUND") {
      player.sendMessage(Messages.LOAD_NOT_FOUND);
      return;
    }

    player.sendMessage(Messages.LOAD_ERROR(result.mensagem || result.erro || "Erro desconhecido"));
  }
}
