"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  ArrowRight,
  Share,
  Sparkles,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";

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

export default function ResultPage() {
  const searchParams = useSearchParams();
  const asset = searchParams.get("asset") || "BTC";
  const amount = searchParams.get("amount") || "100";
  const userPrediction = Number.parseFloat(
    searchParams.get("userPrediction") || "43500"
  );
  const opponentPrediction = Number.parseFloat(
    searchParams.get("opponentPrediction") || "43180.25"
  );
  const finalPrice = Number.parseFloat(
    searchParams.get("finalPrice") || "43425.80"
  );

  const [showResult, setShowResult] = useState(false);

  const userDiff = Math.abs(finalPrice - userPrediction);
  const opponentDiff = Math.abs(finalPrice - opponentPrediction);
  const isWinner = userDiff < opponentDiff;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResult(true);
      if (isWinner) {
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#00F0B5", "#00C896", "#00A078"],
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isWinner]);

  return (
    <div className="min-h-screen neon-bg relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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

      {/* Winner Background Effect */}
      {isWinner && showResult && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/20 via-transparent to-[#00C896]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
        </div>
      )}

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
              <Sparkles className="h-4 w-4 text-[#00F0B5] mr-2" />
              <span className="text-sm text-white/80">Battle Complete</span>
            </motion.div>

            <motion.h1
              className="text-7xl font-bold mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {showResult ? (
                isWinner ? (
                  <span className="neon-text flex items-center justify-center">
                    <Crown className="h-16 w-16 mr-4" />
                    Victory!
                  </span>
                ) : (
                  <span className="text-red-400">Defeat</span>
                )
              ) : (
                <span className="text-white/60">Calculating...</span>
              )}
            </motion.h1>
          </div>

          {/* Final Price */}
          <motion.div
            className="glass-card rounded-3xl p-8 mb-8 neon-glow relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/5 to-transparent" />
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center mb-4">
                <span
                  className="text-5xl mr-4 token-icon p-3 rounded-full"
                  style={{
                    color: assetColors[asset as keyof typeof assetColors],
                    backgroundColor: `${
                      assetColors[asset as keyof typeof assetColors]
                    }20`,
                  }}
                >
                  {assetIcons[asset as keyof typeof assetIcons]}
                </span>
                <h2 className="text-4xl font-bold text-white">{asset}</h2>
              </div>
              <div className="text-6xl font-bold neon-text mb-4">
                ${finalPrice.toFixed(2)}
              </div>
              <div className="flex items-center justify-center text-white/70">
                <Target className="h-6 w-6 mr-2 text-[#00F0B5]" />
                <span className="text-lg">Final Settlement Price</span>
              </div>
            </div>
          </motion.div>

          {/* Results Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* User Result */}
            <motion.div
              className={`glass-card rounded-3xl p-8 border-2 relative overflow-hidden ${
                showResult && isWinner
                  ? "border-[#00F0B5] bg-gradient-to-br from-[#00F0B5]/20 to-transparent neon-glow"
                  : "border-white/20"
              }`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="relative z-10 text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    showResult && isWinner
                      ? "bg-gradient-to-r from-[#00F0B5] to-[#00C896] neon-glow"
                      : "bg-gradient-to-r from-cyan-400 to-blue-500"
                  }`}
                >
                  {showResult && isWinner ? (
                    <Trophy className="h-10 w-10 text-black" />
                  ) : (
                    <div className="text-white font-bold text-lg">YOU</div>
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Your Prediction
                </h3>
                <div className="text-3xl font-bold neon-text mb-4">
                  ${userPrediction.toFixed(2)}
                </div>
                <div
                  className={`text-lg mb-4 ${
                    showResult && isWinner ? "text-[#00F0B5]" : "text-white/60"
                  }`}
                >
                  Off by ${userDiff.toFixed(2)}
                </div>
                {showResult && isWinner && (
                  <motion.div
                    className="text-[#00F0B5] font-bold text-xl pulse-glow"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    🎉 WINNER! 🎉
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Opponent Result */}
            <motion.div
              className={`glass-card rounded-3xl p-8 border-2 relative overflow-hidden ${
                showResult && !isWinner
                  ? "border-[#00F0B5] bg-gradient-to-br from-[#00F0B5]/20 to-transparent neon-glow"
                  : "border-white/20"
              }`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <div className="relative z-10 text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    showResult && !isWinner
                      ? "bg-gradient-to-r from-[#00F0B5] to-[#00C896] neon-glow"
                      : "bg-gradient-to-r from-purple-400 to-pink-500"
                  }`}
                >
                  {showResult && !isWinner ? (
                    <Trophy className="h-10 w-10 text-black" />
                  ) : (
                    <div className="text-white font-bold text-sm">OPP</div>
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">
                  Opponent's Prediction
                </h3>
                <div className="text-3xl font-bold text-purple-400 mb-4">
                  ${opponentPrediction.toFixed(2)}
                </div>
                <div
                  className={`text-lg mb-4 ${
                    showResult && !isWinner ? "text-[#00F0B5]" : "text-white/60"
                  }`}
                >
                  Off by ${opponentDiff.toFixed(2)}
                </div>
                {showResult && !isWinner && (
                  <motion.div
                    className="text-[#00F0B5] font-bold text-xl pulse-glow"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    🎉 WINNER! 🎉
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Prize Pool */}
          <motion.div
            className={`glass-card rounded-3xl p-8 text-center mb-8 relative overflow-hidden ${
              showResult && isWinner ? "border-[#00F0B5] neon-glow" : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/10 to-transparent" />
            <div className="relative z-10">
              <div className="text-5xl font-bold neon-text mb-4 pulse-glow">
                ${Number.parseInt(amount) * 2}
              </div>
              <div className="text-white/70 mb-4 text-xl">
                {showResult && isWinner ? "You Won!" : "Prize Pool"}
              </div>
              {showResult && isWinner && (
                <motion.div
                  className="text-[#00F0B5] font-semibold text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 }}
                >
                  Transferred to your wallet
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <Link href="/lobby">
              <Button className="neon-button px-8 py-4 text-lg font-semibold rounded-full group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Back to Lobby
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/20 to-[#00C896]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>

            <Button className="glass-card border-[#00F0B5]/30 hover:border-[#00F0B5]/50 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 group">
              <Share className="mr-2 h-5 w-5 text-[#00F0B5]" />
              Share Result
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
