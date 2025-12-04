/**
 * Constantes de mensagens exibidas aos jogadores
 */
export const Messages = {
  // Mensagens de salvamento
  SAVING: "§7Salvando inventário...",
  SAVE_SUCCESS: (itemCount: number) => `§aInventário salvo com sucesso! (${itemCount} itens)`,
  SAVE_ERROR: (error: string) => `§cErro ao salvar: ${error}`,

  // Mensagens de carregamento
  LOADING: "§7Carregando inventário...",
  LOAD_SUCCESS: (itemCount: number) => `§aInventário restaurado! (${itemCount} itens)`,
  LOAD_NOT_FOUND: "§eNenhum inventário salvo encontrado. Use um stick para salvar primeiro.",
  LOAD_ERROR: (error: string) => `§cErro ao carregar: ${error}`,

  // Mensagens de erro
  INVENTORY_ERROR: "§cErro: Não foi possível acessar o inventário",
} as const;

