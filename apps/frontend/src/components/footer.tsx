"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Twitter,
  Github,
  DiscIcon as Discord,
  Shield,
  FileText,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <motion.footer
      className="glass-card border-t border-[#00F0B5]/20 mt-20 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00F0B5]/5 via-transparent to-[#00C896]/5" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#00F0B5] to-[#00C896] rounded-xl flex items-center justify-center neon-glow">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <span className="text-2xl font-bold">
                <span className="neon-text">Price</span>
                <span className="text-white">Duel</span>
              </span>
            </div>
            <p className="text-white/70 mb-6 max-w-md leading-relaxed">
              The ultimate crypto prediction battle platform. Duel against other
              traders, predict price movements, and win big in 5-minute battles
              powered by cutting-edge DeFi technology.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Discord, href: "#", label: "Discord" },
                { icon: Github, href: "#", label: "GitHub" },
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-white/70 hover:text-[#00F0B5] hover:neon-glow transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <Zap className="h-4 w-4 text-[#00F0B5] mr-2" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Home", href: "/" },
                { label: "Battle Lobby", href: "/lobby" },
                { label: "History", href: "/history" },
                { label: "Leaderboard", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-[#00F0B5] transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1 h-1 bg-[#00F0B5] rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Security */}
          <div>
            <h3 className="text-white font-semibold mb-6 flex items-center">
              <Shield className="h-4 w-4 text-[#00F0B5] mr-2" />
              Legal & Security
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Terms of Service", href: "#", icon: FileText },
                { label: "Privacy Policy", href: "#", icon: Shield },
                { label: "Risk Disclosure", href: "#", icon: AlertTriangle },
                { label: "Audit Reports", href: "#", icon: Shield },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-[#00F0B5] transition-colors duration-300 flex items-center group"
                  >
                    <link.icon className="h-3 w-3 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#00F0B5]/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/60 text-sm text-center md:text-left">
              © 2024 PriceDuel. All rights reserved. Trading involves risk and
              may not be suitable for all investors.
            </p>
            <div className="flex items-center space-x-4 text-sm text-white/60">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-[#00F0B5] rounded-full mr-2 pulse-glow" />
                Mainnet Live
              </span>
              <span>•</span>
              <span>Audited by CertiK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00F0B5] via-[#00C896] to-[#00A078] opacity-60">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    </motion.footer>
  );
}
