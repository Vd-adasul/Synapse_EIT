'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/5 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8 mb-20">
          
          {/* Branding */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400" />
              <span className="font-serif text-2xl text-white tracking-tight">Synapse</span>
            </Link>
            <p className="mt-6 text-sm font-sans text-neutral-500 leading-relaxed uppercase tracking-wider">
              The neural layer for <br/>
              Decentralized Health.
            </p>
          </div>

          {/* Links Grid */}
          {[
            {
              title: 'Protocol',
              links: ['Architecture', 'Verification', 'Governance', 'Security']
            },
            {
              title: 'Ecosystem',
              links: ['Campaigns', 'DAO', 'Stakeholders', 'Documentation']
            },
            {
              title: 'Company',
              links: ['About', 'Brand Kit', 'Contact', 'Terms']
            }
          ].map((cat) => (
            <div key={cat.title}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white underline decoration-violet-500/50 underline-offset-8 mb-8">
                {cat.title}
              </h4>
              <ul className="space-y-4">
                {cat.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-neutral-500 hover:text-white transition-colors uppercase font-medium tracking-widest text-[11px]">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest">
            © 2026 Synapse Labs. Built on Polygon.
          </p>
          
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
              All Systems Operational
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
          </div>
        </div>
      </div>
    </footer>
  );
}
