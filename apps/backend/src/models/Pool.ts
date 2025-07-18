import mongoose, { Schema, Document } from "mongoose";

export interface IPool extends Document {
  poolId: string;
  asset: "BTC" | "ETH" | "SOL";
  tier: 100 | 500 | 1000;
  status: "waiting" | "active" | "completed";
  player1?: string;
  player2?: string;
  player1Prediction?: number;
  player2Prediction?: number;
  startTime?: number;
  endTime?: number;
  winner?: string;
  createdAt: number;
  finalPrice?: number;
}

const PoolSchema: Schema = new Schema({
  poolId: { type: String, required: true, unique: true },
  asset: { type: String, enum: ["BTC", "ETH", "SOL"], required: true },
  tier: { type: Number, enum: [100, 500, 1000], required: true },
  status: {
    type: String,
    enum: ["waiting", "active", "completed"],
    required: true,
  },
  player1: { type: String },
  player2: { type: String },
  player1Prediction: { type: Number },
  player2Prediction: { type: Number },
  startTime: { type: Number },
  endTime: { type: Number },
  winner: { type: String },
  createdAt: { type: Number, required: true },
  finalPrice: { type: Number },
});

export default mongoose.model<IPool>("Pool", PoolSchema);
