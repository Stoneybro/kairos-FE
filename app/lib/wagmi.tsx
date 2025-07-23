import {createConfig} from '@privy-io/wagmi';
import{http} from "viem";
import { baseSepolia,anvil } from 'wagmi/chains'

export const config = createConfig({
  chains: [baseSepolia,anvil],
  ssr: false,
  transports: {
     [baseSepolia.id]: http('https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY'),
    [anvil.id]:http("http://localhost:8545")
  },
})