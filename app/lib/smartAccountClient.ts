// src/lib/smartAccountClient.ts
import { createSmartAccountClient } from "permissionless";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { http } from "viem";
import { baseSepolia } from "viem/chains";
import { entryPoint06Address } from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { pimlicoClient, publicClient, pimlicoBundlerUrl } from "./pimlico";
import { CONTRACT_ADDRESSES } from "./contracts";

export async function getSmartAccountClient(privateKey: any) {
  const owner = privateKeyToAccount(privateKey);

  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner,
    factoryAddress: CONTRACT_ADDRESSES.ACCOUNT_FACTORY,
    entryPoint: { address: entryPoint06Address, version: "0.6" },
    index: 0n,
  });

  return createSmartAccountClient({
    account: simpleAccount,
    chain: baseSepolia,
    bundlerTransport: http(pimlicoBundlerUrl),
    paymaster: pimlicoClient, // optional
    userOperation: {
        estimateFeesPerGas: async () => {
            return (await pimlicoClient.getUserOperationGasPrice()).fast // only when using pimlico bundler
        },}
  });
}
