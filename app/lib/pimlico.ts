import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { createPublicClient, createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { entryPoint06Address } from "viem/account-abstraction"

export const pimlicoBundlerUrl = "https://api.pimlico.io/v2/84532/rpc?apikey=${process.env.PIMLICO_API_KEY}";
export const pimlicoBundlerTransport = http(pimlicoBundlerUrl);

export const pimlicoClient = createPimlicoClient({ 
  transport: pimlicoBundlerTransport,
  entryPoint: {
    address: entryPoint06Address,
    version: "0.6",
  }
})

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});
