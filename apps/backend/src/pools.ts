import { HermesClient } from "@pythnetwork/hermes-client";
import PoolModel, { IPool } from "./models/Pool";
import UserHistoryModel from "./models/UserHistory";

export type Asset = "BTC" | "ETH" | "SOL";
export type Tier = 100 | 500 | 1000;
export type PoolStatus = "waiting" | "active" | "completed";

const ASSETS: Asset[] = ["BTC", "ETH", "SOL"];
const TIERS: Tier[] = [100, 500, 1000];

const HERMES_ENDPOINT = "https://hermes.pyth.network";
const PYTH_PRICE_IDS = {
  BTC: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
};

const hermesClient = new HermesClient(HERMES_ENDPOINT, {});
const latestPrices: Record<string, number | null> = {
  BTC: null,
  ETH: null,
  SOL: null,
};

async function pollPythPrices() {
  try {
    const priceIds = Object.values(PYTH_PRICE_IDS);
    const priceUpdatesObj = await hermesClient.getLatestPriceUpdates(priceIds);
    const priceUpdates = (priceUpdatesObj as any).parsed as Array<any>;
    for (const [key, id] of Object.entries(PYTH_PRICE_IDS)) {
      const cleanId = id.startsWith("0x")
        ? id.slice(2).toLowerCase()
        : id.toLowerCase();
      const update = Array.isArray(priceUpdates)
        ? priceUpdates.find((p) => p.id?.toLowerCase() === cleanId)
        : undefined;
      if (update?.price?.price && typeof update.price.expo === "number") {
        const value =
          parseFloat(update.price.price) * Math.pow(10, update.price.expo);
        latestPrices[key] = value;
      }
    }
  } catch (e) {
    console.error("[PYTH] Error polling prices:", e);
  }
}

setInterval(pollPythPrices, 5000);
pollPythPrices();

export function getLatestBackendPrice(asset: string): number | null {
  return latestPrices[asset] ?? null;
}

// Always ensure 9 pools exist
export async function initializePools() {
  for (const asset of ASSETS) {
    for (const tier of TIERS) {
      const poolId = `${asset}_${tier}`;
      let pool = await PoolModel.findOne({ poolId });
      if (!pool) {
        await PoolModel.create({
          poolId,
          asset,
          tier,
          status: "waiting",
          createdAt: Date.now(),
        });
      } else {
        // If pool exists but is deleted or corrupted, reset to waiting
        if (!pool.status || !pool.createdAt) {
          pool.status = "waiting";
          pool.createdAt = Date.now();
          await pool.save();
        }
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
  poolId: string
): Promise<{ pool?: IPool; error?: string }> {
  const pool = await PoolModel.findOne({ poolId });
  if (!pool) return { error: "Pool not found" };
  if (pool.status === "completed") {
    return { pool };
  }
  if (pool.status !== "active" || !pool.player1 || !pool.player2) {
    return { error: "Pool not ready to settle" };
  }
  // Fetch the final price from backend's in-memory price store
  const finalPrice = getLatestBackendPrice(pool.asset);
  if (finalPrice == null) {
    return { error: "Final price not available" };
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
  // Store the final price in the pool document
  (pool as any).finalPrice = finalPrice;
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
  }
}

// User history fetch
export async function getUserHistory(wallet: string) {
  return UserHistoryModel.find({ wallet }).sort({ date: -1 });
}
