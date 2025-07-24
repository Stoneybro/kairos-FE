import {createConfig} from '@privy-io/wagmi';
import{http} from "viem";
import { baseSepolia} from 'wagmi/chains'

export const config = createConfig({
  chains: [baseSepolia],
  ssr: false,
  transports: {
     [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
  },
})
