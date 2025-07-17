"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  DollarSign,
  Target,
  Sparkles,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { getLatestPythPrices } from "@/lib/pyth";
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

export default function DuelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState(
    (searchParams.get("asset") as "BTC" | "ETH" | "SOL") || "BTC"
  );
  const [selectedAmount, setSelectedAmount] = useState(
    searchParams.get("amount") || "100"
  );
  const [prediction, setPrediction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [waitingTimeout, setWaitingTimeout] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPredictionInput, setShowPredictionInput] = useState(true);
  const [isPriceLoading, setIsPriceLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const poolId = searchParams.get("poolId");
  const { address: wallet, isConnected } = useAccount();

  // Fetch price logic (unchanged)
  useEffect(() => {
    let isMounted = true;
    async function fetchPrice() {
      setIsPriceLoading(true);
      try {
        const prices = await getLatestPythPrices();
        if (isMounted && prices[selectedAsset]) {
          const price = parseFloat(
            (prices[selectedAsset] as string).replace(/[$,]/g, "")
          );
          setCurrentPrice(price);
        }
      } catch {
        setCurrentPrice(mockPrices[selectedAsset as keyof typeof mockPrices]);
      } finally {
        setIsPriceLoading(false);
      }
    }
    fetchPrice();
    const timer = setTimeout(fetchPrice, 60000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedAsset]);

  // Join pool handler
  const handleSubmit = async () => {
    if (!prediction || !poolId || !wallet) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:4000/api/pools/${poolId}/join`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, prediction: Number(prediction) }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to join pool");
        setIsSubmitting(false);
        return;
      }
      const data = await res.json();
      if (data.status === "waiting") {
        setWaitingRoom(true);
        setShowPredictionInput(false);
        setPolling(true);
      } else if (data.status === "active") {
        // Both players joined, go to match page
        router.push(`/active-duel?poolId=${poolId}&wallet=${wallet}`);
      }
    } catch {
      setError("Failed to join pool");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll pool state if in waiting room
  useEffect(() => {
    if (!polling || !poolId) return;
    let timeout: NodeJS.Timeout;
    const poll = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/pools/${poolId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "active") {
          setPolling(false);
          router.push(`/active-duel?poolId=${poolId}&wallet=${wallet}`);
        } else if (data.status === "waiting" && data.player1 !== wallet) {
          // If player1 is not us, we got kicked (timeout/refund)
          setPolling(false);
          setWaitingTimeout(true);
        } else if (data.status === "waiting" && data.player1 === wallet) {
          // Still waiting
          timeout = setTimeout(poll, 2000);
        } else if (data.status === "waiting" && !data.player1) {
          // Pool reset, timeout
          setPolling(false);
          setWaitingTimeout(true);
        }
      } catch {
        // ignore
      }
    };
    poll();
    return () => clearTimeout(timeout);
  }, [polling, poolId, router, wallet]);

  // UI
  return (
    <div className="min-h-screen neon-bg relative overflow-hidden">
      {/* Floating Numbers Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-[#00F0B5] opacity-20 font-mono text-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -200, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          >
            ${(Math.random() * 50000 + 10000).toFixed(2)}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          className="max-w-2xl mx-auto"
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
              <Target className="h-4 w-4 text-[#00F0B5] mr-2" />
              <span className="text-sm text-white/80">
                Join Prediction Duel
              </span>
            </motion.div>

            <h1 className="text-5xl font-bold mb-4">
              <span className="text-white">Join </span>
              <span className="neon-text">Duel</span>
            </h1>
            <p className="text-xl text-white/70">
              Enter your prediction to join the battle
            </p>
          </div>

          <div className="glass-card rounded-3xl p-8 neon-glow">
            <div className="space-y-8">
              {/* Asset Selection */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 text-[#00F0B5] mr-2" />
                  Select Asset
                </label>
                <Select
                  value={selectedAsset}
                  onValueChange={(value) =>
                    setSelectedAsset(value as "BTC" | "ETH" | "SOL")
                  }
                  disabled
                >
                  <SelectTrigger className="w-full h-16 glass-card rounded-2xl text-white text-lg border-[#00F0B5]/30 hover:border-[#00F0B5]/50 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-[#00F0B5]/30">
                    {Object.keys(assetIcons).map((asset) => (
                      <SelectItem
                        key={asset}
                        value={asset}
                        className="text-white hover:bg-[#00F0B5]/10 focus:bg-[#00F0B5]/10"
                      >
                        <div className="flex items-center">
                          <span
                            className="text-2xl mr-3 token-icon p-1 rounded-full"
                            style={{
                              color:
                                assetColors[asset as keyof typeof assetColors],
                              backgroundColor: `${
                                assetColors[asset as keyof typeof assetColors]
                              }20`,
                            }}
                          >
                            {assetIcons[asset as keyof typeof assetIcons]}
                          </span>
                          <span className="text-lg">{asset}</span>
                          <span className="ml-auto text-[#00F0B5]">
                            $
                            {mockPrices[
                              asset as keyof typeof mockPrices
                            ].toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stake Amount */}
              <div>
                <label className="block text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 text-[#00F0B5] mr-2" />
                  Stake Amount
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {["100", "500", "1000"].map((amount) => (
                    <motion.button
                      key={amount}
                      className={`h-16 rounded-2xl border-2 transition-all duration-300 font-semibold ${
                        selectedAmount === amount
                          ? "border-[#00F0B5] bg-[#00F0B5]/20 text-[#00F0B5] neon-glow"
                          : "glass-card border-[#00F0B5]/30 text-white hover:border-[#00F0B5]/50"
                      }`}
                      disabled
                      onClick={() => setSelectedAmount(amount)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center justify-center">
                        <DollarSign className="h-5 w-5 mr-1" />
                        <span className="text-xl font-bold">{amount}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Current Price Display */}
              <div className="glass-card rounded-2xl p-6 border-[#00F0B5]/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/5 to-transparent" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center">
                    <span
                      className="text-4xl mr-4 token-icon p-2 rounded-full"
                      style={{
                        color: assetColors[selectedAsset],
                        backgroundColor: `${assetColors[selectedAsset]}20`,
                      }}
                    >
                      {assetIcons[selectedAsset]}
                    </span>
                    <div>
                      <div className="text-lg text-white/70">Current Price</div>
                      <div className="text-3xl font-bold neon-text">
                        $
                        {isPriceLoading ? (
                          <span className="text-white/50">Loading...</span>
                        ) : currentPrice !== null ? (
                          currentPrice.toLocaleString()
                        ) : (
                          <span className="text-red-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#00F0B5] pulse-glow" />
                </div>
              </div>

              {/* Prediction Input */}
              {showPredictionInput && (
                <div>
                  <label className="block text-lg font-semibold text-white mb-4 flex items-center">
                    <Target className="h-5 w-5 text-[#00F0B5] mr-2" />
                    Your Price Prediction (in 5 minutes)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-[#00F0B5]" />
                    <Input
                      type="number"
                      placeholder="Enter your prediction..."
                      value={prediction}
                      onChange={(e) => setPrediction(e.target.value)}
                      className="w-full h-16 pl-12 glass-card rounded-2xl text-white text-lg placeholder:text-white/40 border-[#00F0B5]/30 focus:border-[#00F0B5] focus:ring-[#00F0B5]/50 neon-glow"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-center font-semibold mb-4">
                  {error}
                </div>
              )}

              {/* Waiting Room UI */}
              {waitingRoom && (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center">
                    <Clock className="h-10 w-10 text-[#00F0B5] mb-2 animate-pulse" />
                    <div className="text-2xl font-bold neon-text mb-2">
                      Waiting for another player to join...
                    </div>
                    <div className="text-white/70 mb-2">
                      If no one joins in 60 seconds, you will be refunded.
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Users className="h-6 w-6 text-[#00F0B5]" />
                      <span className="text-white font-semibold">
                        1 / 2 joined
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeout/Refund Message */}
              {waitingTimeout && (
                <div className="text-center py-8">
                  <div className="text-red-400 text-2xl font-bold mb-2">
                    Match Timeout – Refunded
                  </div>
                  <div className="text-white/70 mb-4">
                    No other player joined in time. Please try again later.
                  </div>
                  <Button
                    className="neon-button"
                    onClick={() => router.push("/lobby")}
                  >
                    Back to Lobby
                  </Button>
                </div>
              )}

              {/* Submit Button */}
              {showPredictionInput && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={!prediction || isSubmitting || !isConnected}
                    className="neon-button w-full h-16 text-xl font-semibold rounded-2xl transition-all duration-300 group disabled:opacity-50 relative overflow-hidden"
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="flex items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="w-6 h-6 border-2 border-[#00F0B5] border-t-transparent rounded-full animate-spin mr-3" />
                        Processing...
                      </motion.div>
                    ) : (
                      <>
                        <span className="relative z-10 flex items-center">
                          Join Pool
                          <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/20 to-[#00C896]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
