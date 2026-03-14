'use client';

import { useReadContract, useAccount } from 'wagmi';
import { formatUnits, isAddress, zeroAddress } from 'viem';
import { milestoneEscrowABI } from '../abis/MilestoneEscrow';
import OnrampWidget from './OnrampWidget';

const ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Configurable destination wallet — reads from env or uses the default
const DESTINATION_WALLET = process.env.NEXT_PUBLIC_DESTINATION_WALLET || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

const MOCK_MILESTONES = [
  { id: 1, desc: "Initial Admission & Tests", amount: 50000, status: "released" },
  { id: 2, desc: "Cardiac Surgery", amount: 350000, status: "pending_vote" },
  { id: 3, desc: "Post-Op ICU Recovery", amount: 100000, status: "locked" }
];

export default function CampaignDashboard() {
  const { address, isConnected } = useAccount();
  const hasEscrowAddress = isAddress(ESCROW_CONTRACT_ADDRESS) && ESCROW_CONTRACT_ADDRESS !== zeroAddress;
  const escrowAddress = hasEscrowAddress ? ESCROW_CONTRACT_ADDRESS : zeroAddress;

  const { data: totalRaisedRaw } = useReadContract({
    address: escrowAddress,
    abi: milestoneEscrowABI,
    functionName: 'totalRaised',
    query: { enabled: hasEscrowAddress },
  });

  const { data: totalGoalRaw } = useReadContract({
    address: escrowAddress,
    abi: milestoneEscrowABI,
    functionName: 'totalFundingGoal',
    query: { enabled: hasEscrowAddress },
  });

  const raised = totalRaisedRaw ? Number(formatUnits(totalRaisedRaw as bigint, 6)) : 1500;
  const totalGoal = totalGoalRaw ? Number(formatUnits(totalGoalRaw as bigint, 6)) : 5000;
  const progress = Math.round((raised / totalGoal) * 100);

  return (
    <section id="campaign" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24 scroll-mt-24">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        
        {/* LEFT: Stats & Milestones */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Main Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                   <svg className="w-24 h-24 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z"/></svg>
                </div>
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-neutral-500 mb-6 block">Distributed Capital</span>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-6xl font-serif text-white tracking-tighter">${raised.toLocaleString()}</h2>
                   <span className="text-neutral-600 font-serif text-xl italic uppercase tracking-widest">usdc</span>
                </div>
                <div className="mt-10">
                   <div className="flex justify-between text-[10px] uppercase font-sans font-bold tracking-[0.2em] text-neutral-500 mb-3">
                      <span>Threshold Progress</span>
                      <span className="text-cyan-400">{progress}%</span>
                   </div>
                   <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 shadow-[0_0_10px_#8b5cf6]"
                      />
                   </div>
                </div>
             </div>

             <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 group relative overflow-hidden">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans font-semibold text-neutral-500 mb-6 block">Verification Tier</span>
                <div className="flex items-baseline gap-2">
                   <h2 className="text-6xl font-serif text-emerald-500 tracking-tighter">Gold</h2>
                   <span className="text-neutral-600 font-serif text-xl italic uppercase tracking-widest">v-core</span>
                </div>
                <p className="mt-10 text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-[0.2em] leading-relaxed">
                   AI-AUDITED SYBIL RESISTANCE <br/>
                   HOSPITAL SIGNATURE VERIFIED
                </p>
             </div>
          </div>

          {/* Transfer Account Info */}
          <div className="p-8 rounded-[32px] border border-violet-500/10 bg-gradient-to-r from-violet-500/[0.03] to-transparent">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block mb-2">
                  Polygon Receiving Account
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                  <span className="font-mono text-sm text-white">
                    {DESTINATION_WALLET}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Polygon Mainnet
                </span>
              </div>
            </div>
            {isConnected && address && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 block mb-2">
                  Your Connected Wallet
                </span>
                <span className="font-mono text-sm text-neutral-400">
                  {address}
                </span>
              </div>
            )}
          </div>

          {/* Milestone List */}
          <div className="space-y-8">
             <div className="flex items-baseline gap-4 ml-2">
                <h3 className="text-4xl font-serif text-white">Milestones</h3>
                <span className="h-[1px] flex-grow bg-white/5" />
             </div>
             <div className="space-y-4">
                {MOCK_MILESTONES.map((m) => (
                  <div 
                    key={m.id} 
                    className="flex items-center justify-between p-10 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-8">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border font-serif text-xl ${
                        m.status === 'released' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-neutral-800 bg-black text-neutral-600'
                      }`}>
                        {m.id}
                      </div>
                      <div>
                        <p className="font-serif text-2xl text-white tracking-tight">{m.desc}</p>
                        <p className="text-[10px] font-sans font-bold text-neutral-500 uppercase tracking-[0.3em] mt-2">${m.amount.toLocaleString()} USDC Allocated</p>
                      </div>
                    </div>
                    {m.status === 'released' ? (
                      <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[10px] uppercase font-black text-emerald-500 tracking-[0.2em]">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                         Released
                      </div>
                    ) : m.status === 'pending_vote' ? (
                      <button className="px-8 py-3 rounded-full bg-white text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all">
                        Vote
                      </button>
                    ) : (
                      <div className="px-5 py-2 rounded-full border border-white/5 bg-black text-[10px] uppercase font-black text-neutral-600 tracking-[0.2em]">
                         Pending
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT: Action Sidebar */}
        <div className="lg:sticky lg:top-36 space-y-6">
          <div className="p-1 glass rounded-[44px] overflow-hidden group shadow-2xl">
             <div className="bg-[#030303] rounded-[43px] overflow-hidden">
                <OnrampWidget destinationWallet={DESTINATION_WALLET} amount="1000" />
             </div>
          </div>

          <div className="p-12 rounded-[44px] border border-white/5 bg-gradient-to-br from-violet-600/5 to-transparent relative overflow-hidden group">
             <div className="absolute -right-16 -top-16 w-48 h-48 bg-violet-600/10 rounded-full blur-[80px]" />
             <h4 className="text-[10px] font-black font-sans uppercase tracking-[0.4em] text-neutral-500 mb-6">Yield Engine</h4>
             <p className="text-sm font-sans text-neutral-400 leading-relaxed uppercase tracking-widest leading-loose">
                Dynamic rebalancing via <br/>
                Aave V3 core protocol. <br/>
                <span className="text-white text-3xl font-serif mt-4 block">3.45% APY</span>
             </p>
             <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                   Operational
                </div>
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}
