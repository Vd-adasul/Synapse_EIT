'use client';

import * as React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { polygon, polygonAmoy, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const polygonRpcKey = process.env.NEXT_PUBLIC_POLYGON_RPC_KEY;

const connectors = [injected()];

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
    })
  );
}

// Use authenticated RPC when API key is available, otherwise fall back to public
const polygonTransport = polygonRpcKey
  ? http(`https://polygon-mainnet.g.alchemy.com/v2/${polygonRpcKey}`)
  : http();

const polygonAmoyTransport = polygonRpcKey
  ? http(`https://polygon-amoy.g.alchemy.com/v2/${polygonRpcKey}`)
  : http();

const config = createConfig({
  chains: [polygon, polygonAmoy, base],
  connectors,
  transports: {
    [polygon.id]: polygonTransport,
    [polygonAmoy.id]: polygonAmoyTransport,
    [base.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
