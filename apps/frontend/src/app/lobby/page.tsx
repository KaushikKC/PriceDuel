"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Users, Clock, ArrowRight, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
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

const TIERS = [100, 500, 1000];
const ASSETS = ["BTC", "ETH", "SOL"] as const;

type Asset = (typeof ASSETS)[number];

type Pool = {
  poolId: string;
  asset: Asset;
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
};

export default function LobbyPage() {
  const { address: wallet, isConnected } = useAccount();
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset>("BTC");
  const [loading, setLoading] = useState(true);

  // Fetch pools from backend
  const fetchPools = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pools");
      const data = await res.json();
      setPools(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
    // No auto-refresh interval, only fetch once on mount
  }, []);

  // Always show 3x3 grid: 3 tiers x 3 assets
  const poolsByAsset: Record<Asset, (Pool | null)[]> = {
    BTC: [],
    ETH: [],
    SOL: [],
  };
  for (const asset of ASSETS) {
    for (const tier of TIERS) {
      const found = pools.find((p) => p.asset === asset && p.tier === tier);
      poolsByAsset[asset].push(found || null);
    }
  }

  return (
    <div className="min-h-screen neon-bg relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00F0B5] rounded-full opacity-40 floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-center mb-4">
            <span className="text-white">Battle </span>
            <span className="neon-text">Lobby</span>
          </h1>
          <p className="text-xl text-white/70 text-center mb-12">
            Choose your asset and join the prediction battle
          </p>
        </motion.div>

        <Tabs
          value={selectedAsset}
          onValueChange={(value) => setSelectedAsset(value as Asset)}
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TabsList className="grid w-full grid-cols-3 glass-card rounded-2xl p-2 mb-8 max-w-md mx-auto border border-[#00F0B5]/30">
              {ASSETS.map((asset) => (
                <TabsTrigger
                  key={asset}
                  value={asset}
                  className="neon-tab rounded-xl py-4 text-lg font-semibold transition-all duration-300 data-[state=active]:bg-[#00F0B5]/20 data-[state=active]:border-[#00F0B5] data-[state=active]:text-[#00F0B5] data-[state=active]:shadow-[0_0_15px_rgba(0,240,181,0.3)]"
                >
                  <span
                    className="text-2xl mr-2"
                    style={{ color: assetColors[asset] }}
                  >
                    {assetIcons[asset]}
                  </span>
                  {asset}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {ASSETS.map((asset) => (
            <TabsContent key={asset} value={asset}>
              <div className="grid md:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-3 text-center text-white/70">
                    Loading pools...
                  </div>
                ) : (
                  poolsByAsset[asset].map((pool, index) => {
                    if (!pool) {
                      // Placeholder for missing pool
                      return (
                        <div
                          key={asset + "_" + TIERS[index]}
                          className="glass-card rounded-3xl p-8 h-full flex flex-col items-center justify-center opacity-60 border-2 border-dashed border-[#00F0B5]/30"
                        >
                          <div className="text-4xl font-bold neon-text mb-2">
                            ${TIERS[index]}
                          </div>
                          <div
                            className="text-4xl token-icon p-2 rounded-full mb-4"
                            style={{
                              color: assetColors[asset],
                              backgroundColor: `${assetColors[asset]}20`,
                            }}
                          >
                            {assetIcons[asset]}
                          </div>
                          <div className="text-white/60 mb-2">Unavailable</div>
                          <div className="text-white/30 text-sm">
                            Pool not initialized
                          </div>
                        </div>
                      );
                    }
                    const joinedCount = [pool.player1, pool.player2].filter(
                      Boolean
                    ).length;
                    const isWaiting = pool.status === "waiting";
                    return (
                      <motion.div
                        key={pool.poolId}
                        className="group relative"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                        whileHover={{ y: -10, scale: 1.02 }}
                      >
                        <div className="glass-card rounded-3xl p-8 h-full relative overflow-hidden group-hover:neon-glow transition-all duration-300">
                          {/* Gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#00F0B5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Glowing border effect */}
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#00F0B5]/20 to-[#00C896]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <div className="text-4xl font-bold neon-text">
                                ${pool.tier}
                              </div>
                              <div
                                className="text-4xl token-icon p-2 rounded-full"
                                style={{
                                  color: assetColors[asset],
                                  backgroundColor: `${assetColors[asset]}20`,
                                }}
                              >
                                {assetIcons[asset]}
                              </div>
                            </div>
                            <div className="space-y-4 mb-8">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-white/70">
                                  <Users className="h-5 w-5 mr-2 text-[#00F0B5]" />
                                  Players
                                </div>
                                <div className="text-white font-semibold">
                                  {joinedCount}/2
                                </div>
                              </div>
                              {pool.status === "active" && pool.endTime && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-white/70">
                                    <Clock className="h-5 w-5 mr-2 text-[#00F0B5]" />
                                    Time Left
                                  </div>
                                  <div className="neon-text font-semibold pulse-glow">
                                    {(() => {
                                      const left = Math.max(
                                        0,
                                        Math.floor(
                                          (pool.endTime - Date.now()) / 1000
                                        )
                                      );
                                      const m = Math.floor(left / 60);
                                      const s = left % 60;
                                      return `${m}:${s
                                        .toString()
                                        .padStart(2, "0")}`;
                                    })()}
                                  </div>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-white/70">
                                  <Zap className="h-5 w-5 mr-2 text-[#00F0B5]" />
                                  Status
                                </div>
                                <div
                                  className={`font-semibold ${
                                    pool.status === "active"
                                      ? "text-[#00F0B5]"
                                      : pool.status === "waiting"
                                      ? "text-yellow-400"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {pool.status === "active"
                                    ? "Match Started"
                                    : pool.status === "waiting"
                                    ? "Waiting for Player"
                                    : "Completed"}
                                </div>
                              </div>
                              {/* Progress bar for active pools */}
                              {pool.status === "active" && pool.endTime && (
                                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="gradient-progress h-full rounded-full"
                                    style={{
                                      width: `${
                                        100 -
                                        Math.max(
                                          0,
                                          Math.floor(
                                            ((pool.endTime - Date.now()) /
                                              (5 * 60 * 1000)) *
                                              100
                                          )
                                        )
                                      }%`,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                            <Link
                              href={
                                isWaiting
                                  ? `/duel?asset=${asset}&amount=${pool.tier}&poolId=${pool.poolId}`
                                  : "#"
                              }
                              passHref
                            >
                              <Button
                                className="neon-button w-full py-4 text-lg font-semibold rounded-full transition-all duration-300 group relative overflow-hidden"
                                disabled={!isWaiting || !isConnected}
                                tabIndex={isWaiting && isConnected ? 0 : -1}
                              >
                                <span className="relative z-10 flex items-center justify-center">
                                  <Coins className="mr-2 h-5 w-5" />
                                  {isWaiting
                                    ? "Join Now"
                                    : pool.status === "active"
                                    ? "In Progress"
                                    : "Completed"}
                                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/20 to-[#00C896]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
