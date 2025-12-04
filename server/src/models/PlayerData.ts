import mongoose, { Schema, Model } from 'mongoose';
import { IPlayerData } from '../types/PlayerData.js';

const playerDataSchema = new Schema<IPlayerData>(
  {
    id: {
      type: String,
      required: true,
      index: true
    },
    nick: {
      type: String,
      required: true,
      trim: true
    },
    inventory: [
      {
        typeId: {
          type: String,
          required: true
        },
        amount: {
          type: Number,
          required: true,
          min: 0
        },
        slot: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ]
  },
  {
    timestamps: true,
    collection: 'player_data'
  }
);

// Índice composto para busca rápida por nick
playerDataSchema.index({ nick: 1 }, { unique: true });

export const PlayerDataModel: Model<IPlayerData> = mongoose.model<IPlayerData>(
  'PlayerData',
  playerDataSchema
);

