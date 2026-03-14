'use client';

import React from 'react';
import Link from 'next/link';
import CampaignDashboard from '../components/CampaignDashboard';
import DoctorSessionBanner from '../components/DoctorSessionBanner';
import DocumentVerification from '../components/DocumentVerification';


export default function Home() {
  return (
    <main className="relative bg-[#030303]">
      
      {/* --- BACKGROUND ORBS --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[40%] right-[-5%] w-[400px] h-[400px] bg-cyan-400/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[150px] animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 overflow-hidden">
        
        {/* --- HERO SECTION --- */}
        <section className="relative pt-48 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[85vh] flex flex-col items-center justify-center">
          {/* Radial Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-violet-500/20 to-transparent blur-[100px] opacity-50" />
          
          <div className="max-w-7xl mx-auto text-center relative">
            <h1 className="text-7xl sm:text-8xl lg:text-[160px] font-serif leading-[0.85] tracking-[-0.04em] text-white">
              The Neural Layer for <br/> 
              <span className="animate-shimmer block mt-2">Healthcare</span>
            </h1>
            <p className="mt-12 mx-auto max-w-2xl text-lg sm:text-xl font-sans font-medium text-neutral-400 leading-relaxed uppercase tracking-widest leading-loose">
              Decentralized infrastructure bridging AI verification <br className="hidden sm:block"/> 
              with trustless medical financing.
            </p>

            <div className="mt-16 flex flex-wrap justify-center items-center gap-8">
              {/* Shiny Border Button — Primary CTA */}
              <Link href="/onramp" className="group relative p-[1px] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(139,92,246,0.3)]">
                <div className="shiny-border-gradient absolute inset-[-100%] z-0" />
                <div className="shiny-border-content relative z-10 px-10 py-4 rounded-full flex items-center gap-3">
                   <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Start Onramp</span>
                   <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </Link>

              <Link href="#verification" className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500 hover:text-white transition-colors border-b border-white/10 pb-1">
                Verify Documents
              </Link>
            </div>
          </div>
        </section>

        {/* --- METRICS TICKER --- */}
        <div className="w-full bg-black/40 border-y border-white/5 py-5 overflow-hidden">
          <div className="flex animate-[scroll_40s_linear_infinite] whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-20 items-center justify-around min-w-full">
                {[
                  { label: 'Network Hash', val: '224.8 TH/s' },
                  { label: 'Total TVL', val: '$442,109,204', color: 'text-violet-500' },
                  { label: 'AI Nodes', val: '4,102' },
                  { label: 'Verification Velocity', val: '0.04s', color: 'text-cyan-400' },
                  { label: 'Sybil Defense', val: 'Protected' },
                  { label: 'Aave Supply', val: '3.42% APY', color: 'text-emerald-500' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{item.label}</span>
                    <span className={`text-[12px] font-mono font-bold tracking-widest uppercase ${item.color || 'text-white'}`}>{item.val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* --- FEATURE GRID --- */}
        <section id="ecosystem" className="py-48 px-4 sm:px-6 lg:px-8">
           <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   {
                     title: 'Neural Verification',
                     desc: 'AI-driven sybil resistance and fraud detection processing billions of medical data points in real-time.',
                     icon: 'M13 10V3L4 14h7v7l9-11h-7z'
                   },
                   {
                     title: 'Yield Maximization',
                     desc: 'Protocol-level integration with Aave V3 ensuring idle capital generates continuous liquidity for healthcare.',
                     icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                   },
                   {
                     title: 'Gold Tier Trust',
                     desc: 'Hospital signatures verified on-chain to prevent phantom campaigns and verify genuine clinical needs.',
                     icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                   }
                 ].map((feature, idx) => (
                   <div key={idx} className="p-12 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-500 group hover:-translate-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-violet-600/10 flex items-center justify-center mb-8 border border-violet-500/20 group-hover:scale-110 transition-transform">
                         <svg className="w-8 h-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                         </svg>
                      </div>
                      <h3 className="text-3xl font-serif text-white mb-6 underline decoration-violet-500/20 underline-offset-[12px]">{feature.title}</h3>
                      <p className="text-sm font-sans text-neutral-500 leading-relaxed uppercase tracking-wider mb-8">
                         {feature.desc}
                      </p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- DOCUMENT VERIFICATION SECTION --- */}
        <section id="verification">
          <DocumentVerification />
        </section>

        {/* --- CODE INTEGRATION BLOCK --- */}
        <section id="dao" className="py-24 px-4 sm:px-6 lg:px-8">

           <div className="max-w-4xl mx-auto">
              <div className="p-1 glass rounded-[32px] overflow-hidden shadow-3xl bg-black/40">
                 <div className="bg-[#080808]/80 rounded-[31px] overflow-hidden transition-all duration-500 hover:bg-[#080808]">
                    {/* Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/30" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/30" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/30" />
                       </div>
                       <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest">Synapse_Verify.sol</span>
                       <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </div>
                    {/* Content */}
                    <div className="p-10 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre">
                      <div className="text-neutral-600">// Initiate neural node consensus</div>
                      <div className="text-violet-400">import <span className="text-white">&quot;@synapse/core-auth&quot;</span>;</div>
                      <div className="mt-4">
                        <span className="text-cyan-400">contract</span> <span className="text-emerald-400">SybilShield</span> <span className="text-neutral-500">{"{"}</span>
                      </div>
                      <div className="pl-6">
                        <span className="text-violet-400">function</span> <span className="text-emerald-400">verifyCampaign</span>(
                        <span className="text-neutral-500">bytes32</span> sig
                        ) <span className="text-neutral-500">{"{"}</span>
                      </div>
                      <div className="pl-12 text-neutral-500">
                        require(neuralNodes.consensus() &gt; <span className="text-violet-400">THRESHOLD</span>);
                      </div>
                      <div className="pl-6 text-neutral-500">{"}"}</div>
                      <div className="text-neutral-500">{"}"}</div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* --- DOCTOR BANNER --- */}
        <DoctorSessionBanner />

        {/* --- CAMPAIGN COMPONENT --- */}
        <CampaignDashboard />



      </div>
    </main>
  );
}
