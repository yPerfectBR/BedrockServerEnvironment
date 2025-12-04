import mongoose, { Schema, Model } from 'mongoose';
import { ICliente } from '../types/index.js';

const clienteSchema = new Schema<ICliente>(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    nome: {
      type: String,
      required: true,
      trim: true
    },
    saldo: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'clientes'
  }
);

export const ClienteModel: Model<ICliente> = mongoose.model<ICliente>(
  'Cliente',
  clienteSchema
);

