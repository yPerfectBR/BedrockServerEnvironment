import { world, type ItemUseAfterEvent } from "@minecraft/server";
import { MinecraftItemTypes } from "@minecraft/vanilla-data";
import { PlayerInventoryService } from "../services/PlayerInventoryService.js";

const ITEM_ACTIONS = {
  [MinecraftItemTypes.Stick]: "save",
  [MinecraftItemTypes.Compass]: "load",
} as const;

const inventoryService = new PlayerInventoryService();

export function registerItemUseActions(): void {
  world.afterEvents.itemUse.subscribe(handleItemUse);
}

async function handleItemUse(event: ItemUseAfterEvent): Promise<void> {
  const action = ITEM_ACTIONS[event.itemStack.typeId as keyof typeof ITEM_ACTIONS];

  if (action === "save") {
    await inventoryService.save(event.source);
    return;
  }

  if (action === "load") {
    await inventoryService.load(event.source);
  }
}
