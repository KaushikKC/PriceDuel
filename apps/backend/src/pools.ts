import PoolModel, { IPool } from "./models/Pool";
import UserHistoryModel from "./models/UserHistory";

export type Asset = "BTC" | "ETH" | "SOL";
export type Tier = 100 | 500 | 1000;
export type PoolStatus = "waiting" | "active" | "completed";

const ASSETS: Asset[] = ["BTC", "ETH", "SOL"];
const TIERS: Tier[] = [100, 500, 1000];

// Initialize 9 pools if not present
export async function initializePools() {
  for (const asset of ASSETS) {
    for (const tier of TIERS) {
      const poolId = `${asset}_${tier}`;
      const exists = await PoolModel.findOne({ poolId });
      if (!exists) {
        await PoolModel.create({
          poolId,
          asset,
          tier,
          status: "waiting",
          createdAt: Date.now(),
        });
      }
    }
  }
}

export async function listPools(): Promise<IPool[]> {
  return PoolModel.find({});
}

export async function getPool(poolId: string): Promise<IPool | null> {
  return PoolModel.findOne({ poolId });
}

export async function joinPool(
  poolId: string,
  wallet: string,
  prediction: number
): Promise<{ pool?: IPool; error?: string }> {
  const pool = await PoolModel.findOne({ poolId });
  if (!pool) return { error: "Pool not found" };
  if (pool.status === "completed") return { error: "Pool already completed" };

  if (!pool.player1) {
    pool.player1 = wallet;
    pool.player1Prediction = prediction;
    pool.status = "waiting";
    pool.createdAt = Date.now();
    await pool.save();
    return { pool };
  } else if (!pool.player2 && pool.player1 !== wallet) {
    pool.player2 = wallet;
    pool.player2Prediction = prediction;
    pool.status = "active";
    pool.startTime = Date.now();
    pool.endTime = pool.startTime + 5 * 60 * 1000;
    await pool.save();
    return { pool };
  } else {
    return { error: "Pool is full or already joined by this wallet" };
  }
}

export async function leavePool(
  poolId: string,
  wallet: string
): Promise<{ pool?: IPool; error?: string }> {
  const pool = await PoolModel.findOne({ poolId });
  if (!pool) return { error: "Pool not found" };
  if (pool.player1 === wallet && !pool.player2) {
    pool.player1 = undefined;
    pool.player1Prediction = undefined;
    pool.status = "waiting";
    pool.createdAt = Date.now();
    await pool.save();
    return { pool };
  }
  return { error: "Cannot leave pool at this stage" };
}

export async function settlePool(
  poolId: string,
  finalPrice: number
): Promise<{ pool?: IPool; error?: string }> {
  const pool = await PoolModel.findOne({ poolId });
  if (!pool) return { error: "Pool not found" };
  if (pool.status !== "active" || !pool.player1 || !pool.player2) {
    return { error: "Pool not ready to settle" };
  }
  // Determine winner by closest prediction
  const diff1 = Math.abs((pool.player1Prediction ?? 0) - finalPrice);
  const diff2 = Math.abs((pool.player2Prediction ?? 0) - finalPrice);
  let winner: string | undefined = undefined;
  let result1: "win" | "lose" | "draw" = "draw";
  let result2: "win" | "lose" | "draw" = "draw";
  if (diff1 < diff2) {
    winner = pool.player1;
    result1 = "win";
    result2 = "lose";
  } else if (diff2 < diff1) {
    winner = pool.player2;
    result1 = "lose";
    result2 = "win";
  }
  pool.winner = winner || "draw";
  pool.status = "completed";
  pool.endTime = Date.now();
  await pool.save();

  // Save user history for both players
  if (
    pool.player1 &&
    pool.player2 &&
    pool.player1Prediction &&
    pool.player2Prediction
  ) {
    await UserHistoryModel.create({
      wallet: pool.player1,
      poolId: pool.poolId,
      asset: pool.asset,
      tier: pool.tier,
      prediction: pool.player1Prediction,
      opponentPrediction: pool.player2Prediction,
      finalPrice,
      result: result1,
      amount: pool.tier,
      date: Date.now(),
    });
    await UserHistoryModel.create({
      wallet: pool.player2,
      poolId: pool.poolId,
      asset: pool.asset,
      tier: pool.tier,
      prediction: pool.player2Prediction,
      opponentPrediction: pool.player1Prediction,
      finalPrice,
      result: result2,
      amount: pool.tier,
      date: Date.now(),
    });
  }
  return { pool };
}

export async function checkTimeouts() {
  // Called periodically to handle waiting room timeouts
  const now = Date.now();
  const pools = await PoolModel.find({});
  for (const pool of pools) {
    if (pool.status === "waiting" && pool.player1 && !pool.player2) {
      if (now - (pool.createdAt || 0) > 60 * 1000) {
        pool.player1 = undefined;
        pool.player1Prediction = undefined;
        pool.status = "waiting";
        pool.createdAt = now;
        await pool.save();
      }
    }
    if (
      pool.status === "active" &&
      pool.startTime &&
      now > (pool.endTime || 0)
    ) {
      pool.status = "completed";
      pool.endTime = now;
      await pool.save();
    }
  }
}

// User history fetch
export async function getUserHistory(wallet: string) {
  return UserHistoryModel.find({ wallet }).sort({ date: -1 });
}
