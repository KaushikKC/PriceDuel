import { Router, Request, Response } from "express";
import {
  listPools,
  getPool,
  joinPool,
  leavePool,
  settlePool,
  getUserHistory,
  initializePools,
  getLatestBackendPrice,
} from "../pools";

const router = Router();

// Ensure pools are initialized on first request
let poolsInitialized = false;
async function ensurePools() {
  if (!poolsInitialized) {
    await initializePools();
    poolsInitialized = true;
  }
}

// List all pools
router.get("/", async (req: Request, res: Response) => {
  await ensurePools();
  const pools = await listPools();
  res.json(pools);
});

// Get pool by ID
router.get("/:poolId", async (req: Request, res: Response) => {
  await ensurePools();
  const pool = await getPool(req.params.poolId);
  if (!pool) return res.status(404).json({ error: "Pool not found" });
  res.json(pool);
});

// Join pool
router.post("/:poolId/join", async (req: Request, res: Response) => {
  await ensurePools();
  const { wallet, prediction } = req.body;
  if (!wallet || typeof prediction !== "number") {
    return res.status(400).json({ error: "wallet and prediction required" });
  }
  const result = await joinPool(req.params.poolId, wallet, prediction);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result.pool);
});

// Leave pool (waiting room refund/exit)
router.post("/:poolId/leave", async (req: Request, res: Response) => {
  await ensurePools();
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: "wallet required" });
  const result = await leavePool(req.params.poolId, wallet);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result.pool);
});

// Settle pool (after 5 min, with final price)
router.post("/:poolId/settle", async (req: Request, res: Response) => {
  await ensurePools();
  const result = await settlePool(req.params.poolId);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json(result.pool);
});

// User history endpoint
router.get("/user/:wallet/history", async (req: Request, res: Response) => {
  const { wallet } = req.params;
  if (!wallet) return res.status(400).json({ error: "wallet required" });
  const history = await getUserHistory(wallet);
  res.json(history);
});

// Get latest price for an asset
router.get("/price/:asset", async (req: Request, res: Response) => {
  const { asset } = req.params;
  const price = getLatestBackendPrice(asset);
  if (price == null)
    return res.status(404).json({ error: "Price not available" });
  res.json({ price });
});

export default router;
