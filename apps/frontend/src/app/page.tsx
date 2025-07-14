"use client";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const ASSETS = [
  { label: "Bitcoin (BTC)", value: "BTC" },
  { label: "Ethereum (ETH)", value: "ETH" },
  { label: "Solana (SOL)", value: "SOL" },
];

export default function Home() {
  const [asset, setAsset] = useState("BTC");
  const [prediction, setPrediction] = useState("");
  const [stake, setStake] = useState("100");
  const [activePools] = useState([
    {
      asset: "BTC",
      stake: 100,
      player1: "0x123...abcd",
      player2: null,
      prediction1: 65000,
      prediction2: null,
      startTime: Date.now() / 1000,
      joinedTime: null,
      settled: false,
      startPrice: 64900,
    },
  ]);
  const [history] = useState([
    {
      asset: "ETH",
      stake: 100,
      winner: "0x456...ef12",
      prediction1: 3500,
      prediction2: 3550,
      endPrice: 3520,
    },
  ]);

  // TODO: Add contract interaction logic
  const handleCreatePool = () => {
    // Call createPool on contract
    alert("Create Pool (stub)");
  };
  const handleJoinPool = () => {
    // Call joinPool on contract
    alert("Join Pool (stub)");
  };
  const handleSettlePool = () => {
    // Call settlePool on contract
    alert("Settle Pool (stub)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-gray-900/80 rounded-2xl shadow-xl p-8 mb-8 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Prediction Duel</h1>
          <ConnectButton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1">Asset</label>
            <select
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
            >
              {ASSETS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Prediction</label>
            <input
              type="number"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none"
              placeholder="Enter price prediction"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Stake ($)</label>
            <select
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            >
              <option value="100">$100</option>
              <option value="500">$500</option>
              <option value="1000">$1000</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mb-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 transition rounded-lg px-6 py-2 font-semibold shadow"
            onClick={handleCreatePool}
          >
            Create Pool
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 transition rounded-lg px-6 py-2 font-semibold shadow"
            onClick={handleJoinPool}
          >
            Join Pool
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 transition rounded-lg px-6 py-2 font-semibold shadow text-gray-900"
            onClick={handleSettlePool}
          >
            Settle Pool
          </button>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Current Open Pools</h2>
          <div className="space-y-2">
            {activePools.length === 0 ? (
              <div className="text-gray-400">No open pools.</div>
            ) : (
              activePools.map((pool, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-700"
                >
                  <div>
                    <span className="font-bold">{pool.asset}</span> | Stake: $
                    {pool.stake} | Player1: {pool.player1}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      Prediction: {pool.prediction1}
                    </span>
                    <span className="text-xs bg-gray-700 rounded px-2 py-1 ml-2">
                      {pool.settled ? "Settled" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      Start Price: {pool.startPrice}
                    </span>
                    <Countdown
                      startTime={pool.joinedTime || pool.startTime}
                      duration={300}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Past Winners</h2>
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-gray-400">No match history yet.</div>
            ) : (
              history.map((h, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border border-gray-700"
                >
                  <div>
                    <span className="font-bold">{h.asset}</span> | Stake: $
                    {h.stake} | Winner: {h.winner}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      Predictions: {h.prediction1} vs {h.prediction2}
                    </span>
                    <span className="text-xs bg-gray-700 rounded px-2 py-1 ml-2">
                      End Price: {h.endPrice}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <footer className="text-gray-500 mt-8 text-sm">
        Built with ❤️ for Base
      </footer>
    </div>
  );
}

function Countdown({
  startTime,
  duration,
}: {
  startTime: number;
  duration: number;
}) {
  const timeLeft =
    duration - (Math.floor(Date.now() / 1000) - Math.floor(startTime));
  if (timeLeft <= 0) return <span className="text-red-400">Expired</span>;
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  return (
    <span className="text-green-400">
      {min}:{sec.toString().padStart(2, "0")}
    </span>
  );
}
