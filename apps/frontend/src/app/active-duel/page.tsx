"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, Target, Clock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { getLatestPythPrices } from "@/lib/pyth";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

const assetIcons = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
};

const assetColors = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
};

const mockPrices = {
  BTC: 43250.75,
  ETH: 2650.32,
  SOL: 175.89,
};

// Pool type for active duel
interface Pool {
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
}

export default function ActiveDuelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const poolId = searchParams.get("poolId");
  const { address: wallet } = useAccount();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [result, setResult] = useState<null | {
    winner: string;
    finalPrice: number;
  }>(null);
  const [settling, setSettling] = useState(false);

  // Fetch pool state
  useEffect(() => {
    if (!poolId) return;
    let active = true;
    const fetchPool = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/pools/${poolId}`);
        if (!res.ok) throw new Error("Pool not found");
        const data = await res.json();
        if (!active) return;
        setPool(data);
        if (data.status === "active" && data.endTime) {
          const left = Math.max(
            0,
            Math.floor((data.endTime - Date.now()) / 1000)
          );
          setTimeLeft(left);
        } else {
          setTimeLeft(null);
        }
        if (data.status === "completed") {
          setTimeLeft(0);
        }
      } catch {
        setError("Failed to fetch pool");
      } finally {
        setLoading(false);
      }
    };
    fetchPool();
    const pollInterval = setInterval(fetchPool, 2000);
    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, [poolId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Fetch live price
  useEffect(() => {
    if (!pool) return;
    let isMounted = true;
    async function fetchPrice() {
      setIsPriceLoading(true);
      try {
        const prices = await getLatestPythPrices();
        if (isMounted && prices[pool.asset]) {
          const price = parseFloat(
            (prices[pool.asset] as string).replace(/[$,]/g, "")
          );
          setCurrentPrice(price);
        }
      } catch {
        setCurrentPrice(mockPrices[pool.asset as keyof typeof mockPrices]);
      } finally {
        setIsPriceLoading(false);
      }
    }
    fetchPrice();
    const priceTimer = setInterval(fetchPrice, 5000);
    return () => {
      isMounted = false;
      clearInterval(priceTimer);
    };
  }, [pool]);

  // Settle match when countdown ends
  useEffect(() => {
    if (
      !poolId ||
      !pool ||
      pool.status !== "active" ||
      timeLeft === null ||
      timeLeft > 0 ||
      settling
    )
      return;
    setSettling(true);
    const settle = async () => {
      try {
        const res = await fetch(`/api/pools/${poolId}/settle`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finalPrice: currentPrice }),
        });
        if (!res.ok) throw new Error("Failed to settle match");
        const data = await res.json();
        setResult({ winner: data.winner, finalPrice: currentPrice! });
      } catch {
        setError("Failed to settle match");
      }
    };
    settle();
  }, [poolId, pool, timeLeft, currentPrice, settling]);

  // Rematch handler
  const handleRematch = () => {
    router.push("/lobby");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }
  if (!pool) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Pool not found
      </div>
    );
  }

  // Determine user and opponent
  const isPlayer1 = pool && pool.player1 === wallet;
  const userPrediction = pool
    ? isPlayer1
      ? pool.player1Prediction
      : pool.player2Prediction
    : undefined;
  const opponentPrediction = pool
    ? isPlayer1
      ? pool.player2Prediction
      : pool.player1Prediction
    : undefined;

  // Result UI
  if (result) {
    const didWin = result.winner === wallet;
    const isDraw = result.winner === "draw";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center neon-bg">
        <div className="glass-card rounded-3xl p-12 text-center neon-glow">
          <div className="text-4xl font-bold mb-4">
            {isDraw ? "It's a Draw!" : didWin ? "You Won 🏆" : "You Lost 💀"}
          </div>
          <div className="mb-6">
            <div className="text-white/70 mb-2">
              Final Price:{" "}
              <span className="neon-text font-bold">
                ${result.finalPrice?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-center gap-8">
              <div>
                <div className="text-white/60">Your Prediction</div>
                <div className="text-2xl font-bold neon-text">
                  ${userPrediction ?? "-"}
                </div>
              </div>
              <div>
                <div className="text-white/60">Opponent</div>
                <div className="text-2xl font-bold text-purple-400">
                  ${opponentPrediction ?? "-"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button className="neon-button" onClick={handleRematch}>
              Rematch
            </Button>
            <Button
              className="neon-button"
              onClick={() => router.push("/lobby")}
            >
              Back to Lobby
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Progress for countdown circle
  const progress =
    pool && pool.endTime
      ? 100 -
        Math.max(
          0,
          Math.floor(((pool.endTime - Date.now()) / (5 * 60 * 1000)) * 100)
        )
      : 0;

  return (
    <div className="min-h-screen neon-bg relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00F0B5] rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Animated Background Waves */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "linear-gradient(45deg, transparent 30%, rgba(0, 240, 181, 0.1) 50%, transparent 70%)",
          }}
          animate={{
            x: [-100, 100],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Target className="h-4 w-4 text-[#00F0B5] mr-2" />
              <span className="text-sm text-white/80">Battle in Progress</span>
            </motion.div>

            <h1 className="text-5xl font-bold mb-4">
              <span className="text-white">Duel in </span>
              <span className="neon-text">Progress</span>
            </h1>
            <p className="text-xl text-white/70">
              Waiting for the market to settle...
            </p>
          </div>

          {/* Countdown Timer */}
          {pool && pool.status === "active" && timeLeft !== null && (
            <motion.div
              className="text-center mb-12"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative inline-block">
                <div className="glass-card rounded-full p-8 neon-glow">
                  <svg
                    className="w-48 h-48 transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#00F0B5"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 45 * (1 - progress / 100)
                      }`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 45 * (1 - progress / 100),
                      }}
                      transition={{ duration: 0.5 }}
                      style={{
                        filter: "drop-shadow(0 0 10px rgba(0, 240, 181, 0.5))",
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold neon-text mb-2 pulse-glow">
                        {(() => {
                          const mins = Math.floor((timeLeft ?? 0) / 60);
                          const secs = (timeLeft ?? 0) % 60;
                          return `${mins}:${secs.toString().padStart(2, "0")}`;
                        })()}
                      </div>
                      <div className="text-white/60">remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Current Price */}
          <motion.div
            className="glass-card rounded-3xl p-8 mb-8 neon-glow relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/5 to-transparent" />
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-4">
                <span
                  className="text-5xl mr-4 token-icon p-3 rounded-full"
                  style={{
                    color: pool
                      ? assetColors[pool.asset as keyof typeof assetColors]
                      : undefined,
                    backgroundColor: pool
                      ? `${
                          assetColors[pool.asset as keyof typeof assetColors]
                        }20`
                      : undefined,
                  }}
                >
                  {pool
                    ? assetIcons[pool.asset as keyof typeof assetIcons]
                    : ""}
                </span>
                <h2 className="text-4xl font-bold text-white">
                  {pool?.asset ?? "-"}
                </h2>
              </div>
              <motion.div
                className="text-6xl font-bold neon-text mb-4"
                key={currentPrice}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {isPriceLoading ? (
                  <span className="text-white/50">Loading...</span>
                ) : (
                  <>${currentPrice?.toLocaleString()}</>
                )}
              </motion.div>
              <div className="flex items-center justify-center text-[#00F0B5]">
                <TrendingUp className="h-6 w-6 mr-2 pulse-glow" />
                <span className="text-lg">Live Price</span>
              </div>
            </div>
          </motion.div>

          {/* Players */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Player 1 (User) */}
            <motion.div
              className="glass-card rounded-3xl p-6 relative overflow-hidden group"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00F0B5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#00F0B5] to-[#00C896] rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">You</h3>
                <div className="text-3xl font-bold neon-text mb-2">
                  ${userPrediction ?? "-"}
                </div>
                <div className="text-white/60">Your Prediction</div>
              </div>
            </motion.div>

            {/* Player 2 (Opponent) */}
            <motion.div
              className="glass-card rounded-3xl p-6 relative overflow-hidden group"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Opponent
                </h3>
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  ${opponentPrediction ?? "-"}
                </div>
                <div className="text-white/60">Their Prediction</div>
              </div>
            </motion.div>
          </div>

          {/* Stake Info */}
          <motion.div
            className="glass-card rounded-3xl p-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10" />
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-[#00F0B5] mr-3" />
                <span className="text-2xl font-semibold text-white">
                  Prize Pool
                </span>
              </div>
              <div className="text-5xl font-bold text-[#00F0B5] mb-4 neon-text pulse-glow">
                ${pool?.tier ? pool.tier * 2 : "-"}
              </div>
              <div className="text-white/70 text-lg">Winner Takes All</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
