import { http, HttpRequest, HttpRequestMethod, HttpResponse } from "@minecraft/server-net";
import { IPlayerData, ISaveResponse, ILoadResponse } from "../types/Database.js";

/**
 * Classe Database para gerenciar dados de jogadores via HTTP
 * Usa a API do servidor para salvar e carregar dados
 */
export class Database {
  private readonly collectionName: string;
  private readonly apiUrl: string;

  // Constantes para métodos HTTP
  private static readonly HTTP_METHOD_POST = HttpRequestMethod.Post;
  private static readonly HTTP_METHOD_GET = HttpRequestMethod.Get;

  /**
   * Cria uma nova instância do Database
   * @param collectionName Nome da coleção (ex: "playerData")
   * @param apiUrl URL base da API (padrão: http://api:3000)
   */
  constructor(collectionName: string, apiUrl: string = "http://api:3000") {
    this.collectionName = collectionName;
    this.apiUrl = apiUrl;
  }

  /**
   * Valida os dados do jogador antes de salvar
   */
  private validatePlayerData(data: IPlayerData): { valid: boolean; error?: string } {
    // Validação básica dos campos obrigatórios
    if (!data?.id || typeof data.id !== "string" || data.id.trim().length === 0) {
      return { valid: false, error: "ID do jogador é obrigatório e deve ser uma string não vazia" };
    }

    if (!data?.nick || typeof data.nick !== "string" || data.nick.trim().length === 0) {
      return { valid: false, error: "Nick do jogador é obrigatório e deve ser uma string não vazia" };
    }

    // Validação do inventário
    if (!Array.isArray(data.inventory)) {
      return { valid: false, error: "Inventário deve ser um array" };
    }

    // Validação de cada item do inventário
    for (let i = 0; i < data.inventory.length; i++) {
      const item = data.inventory[i];
      
      if (!item?.typeId || typeof item.typeId !== "string" || item.typeId.trim().length === 0) {
        return { valid: false, error: `Item no índice ${i}: typeId é obrigatório e deve ser uma string não vazia` };
      }

      if (typeof item.amount !== "number" || item.amount < 0 || !Number.isInteger(item.amount)) {
        return { valid: false, error: `Item no índice ${i}: amount deve ser um número inteiro não negativo` };
      }

      if (typeof item.slot !== "number" || item.slot < 0 || !Number.isInteger(item.slot)) {
        return { valid: false, error: `Item no índice ${i}: slot deve ser um número inteiro não negativo` };
      }
    }

    return { valid: true };
  }

  /**
   * Cria e configura uma requisição HTTP
   */
  private createRequest(url: string, method: HttpRequestMethod, body?: string): HttpRequest {
    const request = new HttpRequest(url);
    request.method = method;
    request.addHeader("Content-Type", "application/json");
    
    if (body) {
      request.setBody(body);
    }
    
    return request;
  }

  /**
   * Processa a resposta HTTP e retorna os dados parseados
   */
  private parseResponse<T>(response: HttpResponse): T {
    try {
      return JSON.parse(response.body as string) as T;
    } catch {
      throw new Error("Resposta da API não é um JSON válido");
    }
  }

  /**
   * Valida uma chave (nome do jogador)
   */
  private validateKey(key: string): { valid: boolean; error?: string } {
    if (!key || typeof key !== "string" || key.trim().length === 0) {
      return { valid: false, error: "Chave inválida. Deve ser uma string não vazia." };
    }
    return { valid: true };
  }

  /**
   * Salva dados do jogador no banco de dados
   * @param key Chave única (geralmente o nome do jogador)
   * @param data Dados do jogador a serem salvos
   * @returns Promise com o resultado da operação
   */
  async save(key: string, data: IPlayerData): Promise<ISaveResponse> {
    // Validação da chave
    const keyValidation = this.validateKey(key);
    if (!keyValidation.valid) {
      return {
        sucesso: false,
        erro: "INVALID_KEY",
        mensagem: keyValidation.error
      };
    }

    // Validação dos dados
    const dataValidation = this.validatePlayerData(data);
    if (!dataValidation.valid) {
      return {
        sucesso: false,
        erro: "INVALID_DATA",
        mensagem: dataValidation.error
      };
    }

    try {
      const url = `${this.apiUrl}/api/${this.collectionName}/${encodeURIComponent(key.trim())}`;
      const request = this.createRequest(url, Database.HTTP_METHOD_POST, JSON.stringify(data));
      const response = await http.request(request);

      if (response.status >= 200 && response.status < 300) {
        const responseData = this.parseResponse<ISaveResponse>(response);
        return {
          sucesso: true,
          mensagem: responseData.mensagem || "Dados salvos com sucesso"
        };
      }

      // Erro HTTP
      const errorData = this.parseResponse<ISaveResponse>(response);
      return {
        sucesso: false,
        erro: errorData.erro || "UNKNOWN_ERROR",
        mensagem: errorData.mensagem || `Erro ao salvar: Status ${response.status}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        sucesso: false,
        erro: "NETWORK_ERROR",
        mensagem: `Erro de rede: ${errorMessage}`
      };
    }
  }

  /**
   * Carrega dados do jogador do banco de dados
   * @param key Chave única (geralmente o nome do jogador)
   * @returns Promise com os dados do jogador ou null se não encontrado
   */
  async load(key: string): Promise<ILoadResponse> {
    // Validação da chave
    const keyValidation = this.validateKey(key);
    if (!keyValidation.valid) {
      return {
        sucesso: false,
        erro: "INVALID_KEY",
        mensagem: keyValidation.error
      };
    }

    try {
      const url = `${this.apiUrl}/api/${this.collectionName}/${encodeURIComponent(key.trim())}`;
      const request = this.createRequest(url, Database.HTTP_METHOD_GET);
      const response = await http.request(request);

      // Dados não encontrados
      if (response.status === 404) {
        return {
          sucesso: false,
          erro: "NOT_FOUND",
          mensagem: "Dados não encontrados"
        };
      }

      // Resposta de sucesso
      if (response.status >= 200 && response.status < 300) {
        const responseData = this.parseResponse<{ sucesso: boolean; dados?: IPlayerData }>(response);
        
        if (!responseData.sucesso || !responseData.dados) {
          return {
            sucesso: false,
            erro: "INVALID_RESPONSE",
            mensagem: "Resposta inválida da API"
          };
        }

        // Valida os dados recebidos
        const validation = this.validatePlayerData(responseData.dados);
        if (!validation.valid) {
          return {
            sucesso: false,
            erro: "INVALID_DATA",
            mensagem: `Dados inválidos recebidos: ${validation.error}`
          };
        }

        return {
          sucesso: true,
          dados: responseData.dados
        };
      }

      // Outros erros HTTP
      const errorData = this.parseResponse<ILoadResponse>(response);
      return {
        sucesso: false,
        erro: errorData.erro || "UNKNOWN_ERROR",
        mensagem: errorData.mensagem || `Erro ao carregar: Status ${response.status}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        sucesso: false,
        erro: "NETWORK_ERROR",
        mensagem: `Erro de rede: ${errorMessage}`
      };
    }
  }
}

