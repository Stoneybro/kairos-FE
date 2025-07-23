import type { PrivyClientConfig } from "@privy-io/react-auth";
import { anvil, base, baseSepolia } from "viem/chains";

// Replace this with your Privy config
export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    requireUserPasswordOnCreate: false,
  },
  defaultChain:anvil,
  supportedChains: [base, baseSepolia, anvil],
  loginMethods: ["wallet", "email", "google"],
  appearance: {
    accentColor: "#38CCCD",
    theme: "dark",
    landingHeader: "Kairos",
    walletChainType: "ethereum-only",
    walletList: ["detected_wallets"],
  },
};
