import { ItemStack } from "@minecraft/server";
import { Messages } from "../constants/Messages.js";
/**
 * Utilitários para manipulação de inventário do jogador
 */
export class InventoryUtils {
    /**
     * Obtém o container do inventário do jogador
     */
    static getInventoryContainer(player) {
        var _a, _b;
        return (_b = (_a = player.getComponent("inventory")) === null || _a === void 0 ? void 0 : _a.container) !== null && _b !== void 0 ? _b : null;
    }
    /**
     * Converte o inventário do jogador para o formato do banco de dados
     * @param player Jogador
     * @returns Array de itens do inventário (apenas slots não vazios)
     */
    static getInventoryAsArray(player) {
        const container = this.getInventoryContainer(player);
        if (!container) {
            return [];
        }
        const inventory = [];
        // Itera apenas pelos slots que têm itens
        for (let slot = 0; slot < container.size; slot++) {
            const item = container.getItem(slot);
            if (item && item.typeId !== this.AIR_TYPE && item.amount > 0) {
                inventory.push({
                    typeId: item.typeId,
                    amount: item.amount,
                    slot: slot
                });
            }
        }
        return inventory;
    }
    /**
     * Restaura o inventário do jogador a partir dos dados salvos
     * @param player Jogador
     * @param inventoryData Dados do inventário salvos
     */
    static restoreInventory(player, inventoryData) {
        const container = this.getInventoryContainer(player);
        if (!container) {
            player.sendMessage(Messages.INVENTORY_ERROR);
            return;
        }
        // Limpa o inventário atual de forma eficiente
        container.clearAll();
        // Restaura os itens salvos
        let restoredCount = 0;
        for (const itemData of inventoryData) {
            // Valida o slot antes de tentar restaurar
            if (itemData.slot < 0 || itemData.slot >= container.size) {
                console.warn(`Slot inválido: ${itemData.slot} (máximo: ${container.size - 1})`);
                continue;
            }
            // Valida o item antes de criar
            if (!itemData.typeId || itemData.amount <= 0) {
                console.warn(`Item inválido no slot ${itemData.slot}: typeId=${itemData.typeId}, amount=${itemData.amount}`);
                continue;
            }
            try {
                const itemStack = new ItemStack(itemData.typeId, itemData.amount);
                container.setItem(itemData.slot, itemStack);
                restoredCount++;
            }
            catch (error) {
                const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
                console.warn(`Erro ao restaurar item no slot ${itemData.slot} (${itemData.typeId}): ${errorMsg}`);
            }
        }
        // Log para debug (opcional)
        if (restoredCount < inventoryData.length) {
            console.warn(`Restaurados ${restoredCount} de ${inventoryData.length} itens`);
        }
    }
}
InventoryUtils.AIR_TYPE = "minecraft:air";
//# sourceMappingURL=InventoryUtils.js.map