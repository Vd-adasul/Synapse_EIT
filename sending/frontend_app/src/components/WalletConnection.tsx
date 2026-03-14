'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';

// Use Polygon mainnet by default, fall back to Amoy for testing
const TARGET_CHAIN = process.env.NEXT_PUBLIC_NETWORK_MODE === 'testnet' ? polygonAmoy : polygon;

export default function WalletConnection() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) return (
    <div className="w-[100px] h-[36px] bg-white/5 rounded-full animate-pulse" />
  );

  if (!isConnected) {
    if (connectors.length === 0) {
      return (
        <button className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest cursor-not-allowed">
          No Wallet Found
        </button>
      )
    }
    return (
      <div className="flex gap-2">

        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
          >
            Connect
          </button>
        ))}
      </div>
    );
  }

  const isWrongNetwork = chainId !== TARGET_CHAIN.id;

  return (
    <div className="flex items-center gap-3">
      <div className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </div>
      {!isWrongNetwork && (
        <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          {TARGET_CHAIN.name}
        </div>
      )}
      {isWrongNetwork && (
        <button
          onClick={() => switchChain({ chainId: TARGET_CHAIN.id })}
          className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-500 uppercase tracking-widest animate-pulse"
        >
          Switch to {TARGET_CHAIN.name}
        </button>
      )}
      <button
        onClick={() => disconnect()}
        className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-white transition-colors"
      >
        Exit
      </button>
    </div>
  );
}
