'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { configureStore } from '@wagmi/core';
import { createConfig, WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  sepolia,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

const { wallets } = getDefaultWallets();

const config = createConfig({
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    zora,
    sepolia,
  ],
  connectors: connectorsForWallets({
    wallets: [
      ...wallets,
    ],
    appName: 'Tambr',
    projectId: 'YOUR_PROJECT_ID', // Placeholder, user needs to replace this
  }),
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
