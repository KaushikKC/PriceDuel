"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Users, Clock, ArrowRight, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const mockPools = {
  BTC: [
    { amount: 100, status: "active", players: 1, timeLeft: "2m 34s" },
    { amount: 500, status: "empty", players: 0, timeLeft: null },
    { amount: 1000, status: "active", players: 1, timeLeft: "4m 12s" },
  ],
  ETH: [
    { amount: 100, status: "empty", players: 0, timeLeft: null },
    { amount: 500, status: "active", players: 1, timeLeft: "1m 45s" },
    { amount: 1000, status: "empty", players: 0, timeLeft: null },
  ],
  SOL: [
    { amount: 100, status: "active", players: 1, timeLeft: "3m 21s" },
    { amount: 500, status: "empty", players: 0, timeLeft: null },
    { amount: 1000, status: "active", players: 1, timeLeft: "5m 00s" },
  ],
};

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

export default function LobbyPage() {
  const [selectedAsset, setSelectedAsset] =
    useState<keyof typeof mockPools>("BTC");

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
          onValueChange={(value) =>
            setSelectedAsset(value as keyof typeof mockPools)
          }
          className="max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TabsList className="grid w-full grid-cols-3 glass-card rounded-2xl p-2 mb-8 max-w-md mx-auto border border-[#00F0B5]/30">
              {Object.keys(mockPools).map((asset) => (
                <TabsTrigger
                  key={asset}
                  value={asset}
                  className="neon-tab rounded-xl py-4 text-lg font-semibold transition-all duration-300 data-[state=active]:bg-[#00F0B5]/20 data-[state=active]:border-[#00F0B5] data-[state=active]:text-[#00F0B5] data-[state=active]:shadow-[0_0_15px_rgba(0,240,181,0.3)]"
                >
                  <span
                    className="text-2xl mr-2"
                    style={{
                      color: assetColors[asset as keyof typeof assetColors],
                    }}
                  >
                    {assetIcons[asset as keyof typeof assetIcons]}
                  </span>
                  {asset}
                </TabsTrigger>
              ))}
            </TabsList>
          </motion.div>

          {Object.entries(mockPools).map(([asset, pools]) => (
            <TabsContent key={asset} value={asset}>
              <div className="grid md:grid-cols-3 gap-6">
                {pools.map((pool, index) => (
                  <motion.div
                    key={index}
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
                            ${pool.amount}
                          </div>
                          <div
                            className="text-4xl token-icon p-2 rounded-full"
                            style={{
                              color:
                                assetColors[asset as keyof typeof assetColors],
                              backgroundColor: `${
                                assetColors[asset as keyof typeof assetColors]
                              }20`,
                            }}
                          >
                            {assetIcons[asset as keyof typeof assetIcons]}
                          </div>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-white/70">
                              <Users className="h-5 w-5 mr-2 text-[#00F0B5]" />
                              Players
                            </div>
                            <div className="text-white font-semibold">
                              {pool.players}/2
                            </div>
                          </div>

                          {pool.status === "active" && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-white/70">
                                <Clock className="h-5 w-5 mr-2 text-[#00F0B5]" />
                                Time Left
                              </div>
                              <div className="neon-text font-semibold pulse-glow">
                                {pool.timeLeft}
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
                                  : "text-yellow-400"
                              }`}
                            >
                              {pool.status === "active"
                                ? "Waiting for Player"
                                : "Available"}
                            </div>
                          </div>

                          {/* Progress bar for active pools */}
                          {pool.status === "active" && (
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div className="gradient-progress h-full w-1/2 rounded-full"></div>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/duel?asset=${asset}&amount=${
                            pool.amount
                          }&action=${
                            pool.status === "active" ? "join" : "create"
                          }`}
                        >
                          <Button className="neon-button w-full py-4 text-lg font-semibold rounded-full transition-all duration-300 group relative overflow-hidden">
                            <span className="relative z-10 flex items-center justify-center">
                              <Coins className="mr-2 h-5 w-5" />
                              {pool.status === "active"
                                ? "Join Duel"
                                : "Create Duel"}
                              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/20 to-[#00C896]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
