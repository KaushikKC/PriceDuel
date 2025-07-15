"use client";

import { motion } from "framer-motion";
import { Zap, Home, History, Wallet, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLatestPythPrices } from "@/lib/pyth";

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prices, setPrices] = useState<{
    BTC?: number;
    ETH?: number;
    SOL?: number;
  }>({});

  console.log(prices);

  useEffect(() => {
    getLatestPythPrices().then(setPrices);
    const interval = setInterval(
      () => getLatestPythPrices().then(setPrices),
      10000
    );
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/lobby", label: "Lobby", icon: Zap },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <motion.header
      className="sticky top-0 z-50 glass-card border-b border-[#00F0B5]/20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-r from-[#00F0B5] to-[#00C896] rounded-xl flex items-center justify-center neon-glow group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-bold">
              <span className="neon-text">Price</span>
              <span className="text-white">Duel</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "neon-text bg-[#00F0B5]/20 border border-[#00F0B5]/50 neon-glow"
                      : "text-white/70 hover:text-[#00F0B5] hover:bg-[#00F0B5]/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Connect Wallet Button */}
          <div className="flex items-center space-x-4">
            <Button className="neon-button px-6 py-2 rounded-xl font-semibold hidden sm:flex items-center">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden glass-card rounded-2xl mt-4 p-4 border border-[#00F0B5]/20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "neon-text bg-[#00F0B5]/20 border border-[#00F0B5]/50"
                        : "text-white/70 hover:text-[#00F0B5] hover:bg-[#00F0B5]/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <Button className="neon-button w-full mt-4 py-3 rounded-xl font-semibold">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            </nav>
          </motion.div>
        )}
        <div className="flex gap-4 items-center text-xs text-gray-400 mt-2">
          <span>BTC: {prices.BTC ?? "-"}</span>
          <span>ETH: {prices.ETH ?? "-"}</span>
          <span>SOL: {prices.SOL ?? "-"}</span>
        </div>
      </div>
    </motion.header>
  );
}
