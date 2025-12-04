import { http, HttpRequest, HttpRequestMethod } from "@minecraft/server-net";
/**
 * Classe Database para gerenciar dados de jogadores via HTTP
 * Usa a API do servidor para salvar e carregar dados
 */
export class Database {
    /**
     * Cria uma nova instância do Database
     * @param collectionName Nome da coleção (ex: "playerData")
     * @param apiUrl URL base da API (padrão: http://api:3000)
     */
    constructor(collectionName, apiUrl = "http://api:3000") {
        this.collectionName = collectionName;
        this.apiUrl = apiUrl;
    }
    /**
     * Valida os dados do jogador antes de salvar
     */
    validatePlayerData(data) {
        // Validação básica dos campos obrigatórios
        if (!(data === null || data === void 0 ? void 0 : data.id) || typeof data.id !== "string" || data.id.trim().length === 0) {
            return { valid: false, error: "ID do jogador é obrigatório e deve ser uma string não vazia" };
        }
        if (!(data === null || data === void 0 ? void 0 : data.nick) || typeof data.nick !== "string" || data.nick.trim().length === 0) {
            return { valid: false, error: "Nick do jogador é obrigatório e deve ser uma string não vazia" };
        }
        // Validação do inventário
        if (!Array.isArray(data.inventory)) {
            return { valid: false, error: "Inventário deve ser um array" };
        }
        // Validação de cada item do inventário
        for (let i = 0; i < data.inventory.length; i++) {
            const item = data.inventory[i];
            if (!(item === null || item === void 0 ? void 0 : item.typeId) || typeof item.typeId !== "string" || item.typeId.trim().length === 0) {
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
    createRequest(url, method, body) {
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
    parseResponse(response) {
        try {
            return JSON.parse(response.body);
        }
        catch (_a) {
            throw new Error("Resposta da API não é um JSON válido");
        }
    }
    /**
     * Valida uma chave (nome do jogador)
     */
    validateKey(key) {
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
    save(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const response = yield http.request(request);
                if (response.status >= 200 && response.status < 300) {
                    const responseData = this.parseResponse(response);
                    return {
                        sucesso: true,
                        mensagem: responseData.mensagem || "Dados salvos com sucesso"
                    };
                }
                // Erro HTTP
                const errorData = this.parseResponse(response);
                return {
                    sucesso: false,
                    erro: errorData.erro || "UNKNOWN_ERROR",
                    mensagem: errorData.mensagem || `Erro ao salvar: Status ${response.status}`
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
                return {
                    sucesso: false,
                    erro: "NETWORK_ERROR",
                    mensagem: `Erro de rede: ${errorMessage}`
                };
            }
        });
    }
    /**
     * Carrega dados do jogador do banco de dados
     * @param key Chave única (geralmente o nome do jogador)
     * @returns Promise com os dados do jogador ou null se não encontrado
     */
    load(key) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const response = yield http.request(request);
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
                    const responseData = this.parseResponse(response);
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
                const errorData = this.parseResponse(response);
                return {
                    sucesso: false,
                    erro: errorData.erro || "UNKNOWN_ERROR",
                    mensagem: errorData.mensagem || `Erro ao carregar: Status ${response.status}`
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
                return {
                    sucesso: false,
                    erro: "NETWORK_ERROR",
                    mensagem: `Erro de rede: ${errorMessage}`
                };
            }
        });
    }
}
// Constantes para métodos HTTP
Database.HTTP_METHOD_POST = HttpRequestMethod.Post;
Database.HTTP_METHOD_GET = HttpRequestMethod.Get;
//# sourceMappingURL=Database.js.map