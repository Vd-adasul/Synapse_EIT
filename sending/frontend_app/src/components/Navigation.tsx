'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WalletConnection from './WalletConnection';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[720px] z-50 transition-all duration-500 ${
        scrolled ? 'scale-95' : 'scale-100'
      }`}
    >
      <div className="glass rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-serif text-lg text-white leading-none">Synapse</span>
        </Link>

        {/* Links */}
        <div className="hidden sm:flex items-center gap-6">
          {[
            { label: 'Ecosystem', href: '#ecosystem' },
            { label: 'Campaigns', href: '#campaign' },
            { label: 'Onramp', href: '/onramp', highlight: true },
          ].map((item) => (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`text-[12px] uppercase font-sans font-medium tracking-widest transition-colors ${
                item.highlight
                  ? 'text-violet-400 hover:text-violet-300'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA / Wallet */}
        <div className="flex items-center gap-4">
          <WalletConnection />
        </div>
      </div>
    </nav>
  );
}
