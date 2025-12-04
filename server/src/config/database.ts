import mongoose from 'mongoose';

export class Database {
  private static instance: Database | null = null;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (Database.instance === null) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      console.log('Database já está conectado');
      return;
    }

    try {
      await mongoose.connect(uri);
      this.isConnected = true;
      console.log('✅ Conectado ao MongoDB com sucesso!');
      
      mongoose.connection.on('error', (error) => {
        console.error('❌ Erro na conexão MongoDB:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB desconectado');
        this.isConnected = false;
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao conectar ao MongoDB:', errorMessage);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Desconectado do MongoDB');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao desconectar do MongoDB:', errorMessage);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

