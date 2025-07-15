"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Users,
  Trophy,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen neon-bg relative overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00F0B5] rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 1, 0.3],
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

      {/* Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-[#00F0B5] rounded-full opacity-10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-48 h-48 bg-[#00C896] rounded-full opacity-8 blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="h-4 w-4 text-[#00F0B5] mr-2" />
            <span className="text-sm text-white/80">
              Next-Gen Prediction Platform
            </span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <span className="neon-text">Price</span>
            <span className="text-white">Duel</span>
          </motion.h1>

          <motion.p
            className="text-3xl md:text-4xl font-semibold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Duel. Predict. <span className="neon-text">Win.</span>
          </motion.p>

          <motion.p
            className="text-xl text-white/70 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Enter 1v1 crypto prediction battles. Stake your tokens, predict the
            future price, and win it all in 5 minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Link href="/lobby">
              <Button className="neon-button px-8 py-4 text-xl font-semibold rounded-full shadow-2xl group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Start Predicting
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/20 to-[#00C896]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          className="mt-32 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            How It <span className="neon-text">Works</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-12 w-12" />,
                title: "Choose Your Battle",
                description:
                  "Select BTC, ETH, or SOL and stake $100, $500, or $1000",
                gradient: "from-[#00F0B5] to-[#00C896]",
              },
              {
                icon: <Users className="h-12 w-12" />,
                title: "Make Your Prediction",
                description:
                  "Enter your price prediction and wait for an opponent to join",
                gradient: "from-[#00C896] to-[#00A078]",
              },
              {
                icon: <Trophy className="h-12 w-12" />,
                title: "Winner Takes All",
                description:
                  "Closest prediction after 5 minutes wins the entire pot",
                gradient: "from-[#00A078] to-[#008060]",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                <div className="glass-card rounded-3xl p-8 h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00F0B5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10">
                    <div
                      className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.gradient} mb-6 neon-glow`}
                    >
                      <div className="text-black">{step.icon}</div>
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-white/70 text-lg">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-32 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          {[
            {
              label: "Total Volume",
              value: "$2.4M",
              icon: <TrendingUp className="h-8 w-8" />,
            },
            {
              label: "Active Duels",
              value: "156",
              icon: <Zap className="h-8 w-8" />,
            },
            {
              label: "Winners Today",
              value: "89",
              icon: <Trophy className="h-8 w-8" />,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center glass-card rounded-2xl p-6 pulse-glow"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-center mb-4 text-[#00F0B5]">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold neon-text mb-2">
                {stat.value}
              </div>
              <div className="text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
