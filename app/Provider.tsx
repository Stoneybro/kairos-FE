// app/providers.tsx
"use client";
import { ThemeProvider } from "./theme-provider";
import { Toaster, toast } from "sonner";
import { ReactNode } from "react";
import {WagmiProvider} from '@privy-io/wagmi';
import { privyConfig } from "./lib/privyConfig";
import {PrivyProvider} from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./lib/wagmi";


const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider appId={`${process.env.NEXT_PUBLIC_PRIVY_ID}`} config={privyConfig}>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
    
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            enableSystem
            disableTransitionOnChange
          >
            <Toaster position="top-center" />
            {children}
          </ThemeProvider>

      </WagmiProvider>
    </QueryClientProvider>
    </PrivyProvider>

  );
}
//2tafFFF6hRxu7ULnRDaoumiEmmbisVUJPoy5TmViM3UmQzifGJT4fvZdL7ZZLniZ349EA6YtiWBPYStDxXKXEQkH
//cmd8m1w3p0031jy0mmmon7ytw