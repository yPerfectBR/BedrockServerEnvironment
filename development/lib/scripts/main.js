import { world } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { Database } from "./database/Database.js";
import { InventoryUtils } from "./utils/InventoryUtils.js";
import { Messages } from "./constants/Messages.js";
import { Config } from "./constants/Config.js";
/**
 * Mapeamento de itens para ações
 */
const ITEM_ACTIONS = {
    [MinecraftItemTypes.Stick]: "save",
    [MinecraftItemTypes.Compass]: "load",
};
/**
 * Inicialização do sistema de banco de dados
 */
const db = new Database(Config.COLLECTION_NAME, Config.API_URL);
/**
 * Salva o inventário atual do jogador no banco de dados
 * @param player Jogador cujo inventário será salvo
 */
function savePlayerInventory(player) {
    return __awaiter(this, void 0, void 0, function* () {
        const inventory = InventoryUtils.getInventoryAsArray(player);
        // Cria os dados do jogador
        const playerData = {
            id: player.id,
            nick: player.name,
            inventory: inventory
        };
        // Exibe mensagem de progresso
        player.sendMessage(Messages.SAVING);
        // Salva no banco de dados
        const result = yield db.save(player.name, playerData);
        // Feedback ao jogador
        if (result.sucesso) {
            player.sendMessage(Messages.SAVE_SUCCESS(inventory.length));
        }
        else {
            player.sendMessage(Messages.SAVE_ERROR(result.mensagem || result.erro || "Erro desconhecido"));
        }
    });
}
/**
 * Carrega e restaura o inventário salvo do jogador
 * @param player Jogador cujo inventário será restaurado
 */
function loadPlayerInventory(player) {
    return __awaiter(this, void 0, void 0, function* () {
        // Exibe mensagem de progresso
        player.sendMessage(Messages.LOADING);
        // Carrega do banco de dados
        const result = yield db.load(player.name);
        if (result.sucesso && result.dados) {
            // Restaura o inventário
            InventoryUtils.restoreInventory(player, result.dados.inventory);
            player.sendMessage(Messages.LOAD_SUCCESS(result.dados.inventory.length));
        }
        else {
            // Tratamento de erros específicos
            if (result.erro === "NOT_FOUND") {
                player.sendMessage(Messages.LOAD_NOT_FOUND);
            }
            else {
                player.sendMessage(Messages.LOAD_ERROR(result.mensagem || result.erro || "Erro desconhecido"));
            }
        }
    });
}
/**
 * Evento de uso de item - Detecta quando o jogador usa um item
 */
world.afterEvents.itemUse.subscribe((ev) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemStack, source: player } = ev;
    const action = ITEM_ACTIONS[itemStack.typeId];
    if (action === "save") {
        yield savePlayerInventory(player);
    }
    else if (action === "load") {
        yield loadPlayerInventory(player);
    }
}));
//# sourceMappingURL=main.js.map