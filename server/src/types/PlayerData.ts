export interface IInventoryItem {
  typeId: string;
  amount: number;
  slot: number;
}

export interface IPlayerData {
  id: string;
  nick: string;
  inventory: IInventoryItem[];
}

