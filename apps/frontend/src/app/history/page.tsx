"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  Sparkles,
  Award,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

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

export default function HistoryPage() {
  const { address: wallet, isConnected } = useAccount();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!wallet) return;
    setLoading(true);
    fetch(`/api/pools/user/${wallet}/history`).then(async (res) => {
      const data = await res.json();
      setHistory(data);
      setLoading(false);
    });
  }, [wallet]);

  const wins = history.filter((duel) => duel.winner === "user").length;
  const totalDuels = history.length;
  const winRate = ((wins / totalDuels) * 100).toFixed(1);
  const totalWinnings = history
    .filter((duel) => duel.winner === "user")
    .reduce((sum, duel) => sum + duel.amount * 2, 0);

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

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <BarChart3 className="h-4 w-4 text-[#00F0B5] mr-2" />
              <span className="text-sm text-white/80">
                Performance Analytics
              </span>
            </motion.div>

            <h1 className="text-5xl font-bold mb-4">
              <span className="text-white">Duel </span>
              <span className="neon-text">History</span>
            </h1>
            <p className="text-xl text-white/70">
              Track your prediction battle performance
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-12 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="glass-card rounded-2xl p-6 text-center neon-glow relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F0B5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <Trophy className="h-8 w-8 text-[#00F0B5] mx-auto mb-3 pulse-glow" />
              <div className="text-3xl font-bold neon-text mb-2">{wins}</div>
              <div className="text-white/60">Total Wins</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F0B5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <Target className="h-8 w-8 text-[#00F0B5] mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {totalDuels}
              </div>
              <div className="text-white/60">Total Duels</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F0B5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <TrendingUp className="h-8 w-8 text-[#00F0B5] mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-2">
                {winRate}%
              </div>
              <div className="text-white/60">Win Rate</div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center neon-glow relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F0B5]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <Award className="h-8 w-8 text-[#00F0B5] mx-auto mb-3 pulse-glow" />
              <div className="text-3xl font-bold neon-text mb-2">
                ${totalWinnings}
              </div>
              <div className="text-white/60">Total Winnings</div>
            </div>
          </div>
        </motion.div>

        {/* History Table */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass-card rounded-3xl border border-[#00F0B5]/30 overflow-hidden neon-glow">
            {/* Table Header */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-6 border-b border-[#00F0B5]/20 bg-gradient-to-r from-[#00F0B5]/10 to-transparent">
              <div className="font-semibold text-[#00F0B5] flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Match ID
              </div>
              <div className="font-semibold text-white/80 hidden md:block">
                Date
              </div>
              <div className="font-semibold text-white/80 hidden md:block">
                Asset
              </div>
              <div className="font-semibold text-white/80 hidden md:block">
                Your Prediction
              </div>
              <div className="font-semibold text-white/80 hidden md:block">
                Opponent
              </div>
              <div className="font-semibold text-white/80 hidden md:block">
                Final Price
              </div>
              <div className="font-semibold text-white/80">Result</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#00F0B5]/10">
              {history.map((duel, index) => (
                <motion.div
                  key={duel.id}
                  className="grid grid-cols-2 md:grid-cols-7 gap-4 p-6 hover:bg-[#00F0B5]/5 transition-colors duration-200 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  {/* Match ID */}
                  <div className="neon-text font-mono text-sm font-semibold">
                    {duel.id}
                  </div>

                  {/* Date - Hidden on mobile */}
                  <div className="text-white/70 text-sm hidden md:block">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#00F0B5]" />
                      {new Date(duel.date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Asset - Hidden on mobile */}
                  <div className="hidden md:block">
                    <div className="flex items-center">
                      <span
                        className="text-2xl mr-2 token-icon p-1 rounded-full"
                        style={{
                          color:
                            assetColors[duel.asset as keyof typeof assetColors],
                          backgroundColor: `${
                            assetColors[duel.asset as keyof typeof assetColors]
                          }20`,
                        }}
                      >
                        {assetIcons[duel.asset as keyof typeof assetIcons]}
                      </span>
                      <span className="text-white font-semibold">
                        {duel.asset}
                      </span>
                    </div>
                  </div>

                  {/* Your Prediction - Hidden on mobile */}
                  <div className="text-white font-mono text-sm hidden md:block">
                    ${duel.userPrediction.toFixed(2)}
                  </div>

                  {/* Opponent - Hidden on mobile */}
                  <div className="text-white/70 font-mono text-sm hidden md:block">
                    ${duel.opponentPrediction.toFixed(2)}
                  </div>

                  {/* Final Price - Hidden on mobile */}
                  <div className="neon-text font-mono text-sm hidden md:block">
                    ${duel.finalPrice.toFixed(2)}
                  </div>

                  {/* Result */}
                  <div className="flex items-center justify-end md:justify-start">
                    <Badge
                      className={`${
                        duel.winner === "user"
                          ? "bg-[#00F0B5]/20 text-[#00F0B5] border-[#00F0B5]/50 shadow-[0_0_10px_rgba(0,240,181,0.3)]"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      } border font-semibold`}
                    >
                      {duel.winner === "user" ? (
                        <>
                          <Trophy className="h-3 w-3 mr-1" />
                          Won ${duel.amount * 2}
                        </>
                      ) : (
                        <>Lost ${duel.amount}</>
                      )}
                    </Badge>
                  </div>

                  {/* Mobile Details */}
                  <div className="md:hidden col-span-2 mt-2 pt-2 border-t border-[#00F0B5]/20">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-white/60">Asset: </span>
                        <span className="text-white font-semibold">
                          {duel.asset}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Date: </span>
                        <span className="text-white">
                          {new Date(duel.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Your: </span>
                        <span className="text-white">
                          ${duel.userPrediction.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Final: </span>
                        <span className="neon-text">
                          ${duel.finalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
