'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface OnrampWidgetProps {
  destinationWallet: string;
  amount: string;
}

export default function OnrampWidget({ destinationWallet, amount }: OnrampWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const appId = process.env.NEXT_PUBLIC_ONRAMP_APP_ID;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // Validate appId exists
    if (!appId || appId === '12345') {
      setWidgetStatus('error');
      setErrorMessage('Missing Onramp App ID. Please set NEXT_PUBLIC_ONRAMP_APP_ID in .env');
      return;
    }

    setWidgetStatus('ready');
  }, [mounted, appId]);

  const handleIframeLoad = useCallback(() => {
    setWidgetStatus('ready');
  }, []);

  const handleIframeError = useCallback(() => {
    setWidgetStatus('error');
    setErrorMessage('Failed to load Onramp widget. Please try again.');
  }, []);

  if (!mounted) return null;

  // Use the wallet from env or prop
  const wallet = destinationWallet || process.env.NEXT_PUBLIC_DESTINATION_WALLET || '';
  
  // Build the Onramp URL with all required parameters
  // Using the appId directly - Onramp.money accepts UUID format app IDs
  const onrampUrl = `https://onramp.money/main/buy/?appId=${appId}&walletAddress=${wallet}&coinCode=USDC&network=polygon&fiatAmount=${amount}&fiatType=INR`;

  return (
    <div className="w-full flex flex-col max-w-md mx-auto items-center justify-center p-10 bg-[#0a0a0a]/50 rounded-[40px]">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-6 block">Fiat Rails Integration</span>
        <h3 className="text-3xl font-serif text-white mb-4 text-center">Instant Deposit</h3>
        <p className="text-neutral-500 text-[11px] font-sans font-bold uppercase tracking-widest mb-10 text-center leading-relaxed">
          Automated INR to USDC settlement <br/>
          via Polygon Smart Contracts.
        </p>
        
        {widgetStatus === 'error' ? (
          <div className="w-full rounded-[24px] overflow-hidden border border-red-500/20 bg-red-500/5 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-red-400 text-sm font-semibold mb-2">Widget Error</p>
            <p className="text-neutral-500 text-xs">{errorMessage}</p>
          </div>
        ) : (
          <div className="w-full rounded-[24px] overflow-hidden border border-white/5 bg-black relative">
            {widgetStatus === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    Initializing Onramp...
                  </span>
                </div>
              </div>
            )}
            <iframe 
              src={onrampUrl} 
              height="500" 
              width="100%" 
              title="Onramp.money Widget"
              className="w-full opacity-90 transition-opacity hover:opacity-100"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="camera;microphone;payment"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
            />
          </div>
        )}

        {/* Status footer */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${
              widgetStatus === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
              widgetStatus === 'error' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' :
              'bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse'
            }`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
              {widgetStatus === 'ready' ? 'Merchant ID Verified' : 
               widgetStatus === 'error' ? 'Connection Failed' :
               'Connecting...'}
            </span>
          </div>
          <span className="text-[8px] font-mono text-neutral-700">
            {appId ? `ID: ${appId.slice(0, 8)}...` : 'No credentials configured'}
          </span>
          {/* Receiving wallet display */}
          <div className="mt-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
            <span className="text-[9px] font-mono text-neutral-600">
              → {wallet.slice(0, 6)}...{wallet.slice(-4)} (Polygon)
            </span>
          </div>
        </div>
    </div>
  );
}
