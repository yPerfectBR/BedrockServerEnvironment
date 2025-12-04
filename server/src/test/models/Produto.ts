import mongoose, { Schema, Model } from 'mongoose';
import { IProduto } from '../types/index.js';

const produtoSchema = new Schema<IProduto>(
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
    quantidadeEstoque: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    valorUnitario: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true,
    collection: 'produtos'
  }
);

export const ProdutoModel: Model<IProduto> = mongoose.model<IProduto>(
  'Produto',
  produtoSchema
);

