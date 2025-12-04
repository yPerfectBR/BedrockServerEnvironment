import { world, ItemUseAfterEvent, Player } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { Database } from "./database/Database.js";
import { InventoryUtils } from "./utils/InventoryUtils.js";
import { IPlayerData } from "./types/Database.js";
import { Messages } from "./constants/Messages.js";
import { Config } from "./constants/Config.js";

/**
 * Mapeamento de itens para ações
 */
const ITEM_ACTIONS = {
  [MinecraftItemTypes.Stick]: "save",
  [MinecraftItemTypes.Compass]: "load",
} as const;

/**
 * Inicialização do sistema de banco de dados
 */
const db = new Database(Config.COLLECTION_NAME, Config.API_URL);

/**
 * Salva o inventário atual do jogador no banco de dados
 * @param player Jogador cujo inventário será salvo
 */
async function savePlayerInventory(player: Player): Promise<void> {
  const inventory = InventoryUtils.getInventoryAsArray(player);
  
  // Cria os dados do jogador
  const playerData: IPlayerData = {
    id: player.id,
    nick: player.name,
    inventory: inventory
  };

  // Exibe mensagem de progresso
  player.sendMessage(Messages.SAVING);
  
  // Salva no banco de dados
  const result = await db.save(player.name, playerData);

  // Feedback ao jogador
  if (result.sucesso) {
    player.sendMessage(Messages.SAVE_SUCCESS(inventory.length));
  } else {
    player.sendMessage(Messages.SAVE_ERROR(result.mensagem || result.erro || "Erro desconhecido"));
  }
}

/**
 * Carrega e restaura o inventário salvo do jogador
 * @param player Jogador cujo inventário será restaurado
 */
async function loadPlayerInventory(player: Player): Promise<void> {
  // Exibe mensagem de progresso
  player.sendMessage(Messages.LOADING);
  
  // Carrega do banco de dados
  const result = await db.load(player.name);

  if (result.sucesso && result.dados) {
    // Restaura o inventário
    InventoryUtils.restoreInventory(player, result.dados.inventory);
    player.sendMessage(Messages.LOAD_SUCCESS(result.dados.inventory.length));
  } else {
    // Tratamento de erros específicos
    if (result.erro === "NOT_FOUND") {
      player.sendMessage(Messages.LOAD_NOT_FOUND);
    } else {
      player.sendMessage(Messages.LOAD_ERROR(result.mensagem || result.erro || "Erro desconhecido"));
    }
  }
}

/**
 * Evento de uso de item - Detecta quando o jogador usa um item
 */
world.afterEvents.itemUse.subscribe(async (ev: ItemUseAfterEvent) => {
  const { itemStack, source: player } = ev;
  const action = ITEM_ACTIONS[itemStack.typeId as keyof typeof ITEM_ACTIONS];

  if (action === "save") {
    await savePlayerInventory(player);
  } else if (action === "load") {
    await loadPlayerInventory(player);
  }
});