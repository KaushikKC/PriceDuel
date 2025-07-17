import mongoose, { Schema, Document } from "mongoose";

export interface IUserHistory extends Document {
  wallet: string;
  poolId: string;
  asset: "BTC" | "ETH" | "SOL";
  tier: 100 | 500 | 1000;
  prediction: number;
  opponentPrediction: number;
  finalPrice: number;
  result: "win" | "lose" | "draw";
  amount: number;
  date: number;
}

const UserHistorySchema: Schema = new Schema({
  wallet: { type: String, required: true, index: true },
  poolId: { type: String, required: true },
  asset: { type: String, enum: ["BTC", "ETH", "SOL"], required: true },
  tier: { type: Number, enum: [100, 500, 1000], required: true },
  prediction: { type: Number, required: true },
  opponentPrediction: { type: Number, required: true },
  finalPrice: { type: Number, required: true },
  result: { type: String, enum: ["win", "lose", "draw"], required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
});

export default mongoose.model<IUserHistory>("UserHistory", UserHistorySchema);
