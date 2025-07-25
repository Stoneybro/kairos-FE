// src/lib/customSmartAccount.ts

import {
  toSmartAccount,
  getUserOperationHash,
  type UserOperation,
  type EntryPointVersion,
} from "viem/account-abstraction";
import {
  type Address,
  type Client,
  type Hex,
  type Transport,
  type EIP1193Provider,
  type UnionPartialBy,
  encodeFunctionData,
  parseAbi,
  bytesToHex,
  createWalletClient,
  custom,
  toHex
} from "viem";

import { entryPoint06Address } from "viem/account-abstraction";
import { publicClient } from "./pimlico";
import { ACCOUNT_FACTORY_ABI, SMART_ACCOUNT_ABI } from "./contracts";
import { baseSepolia } from "viem/chains";

// Using parseAbi for clean and type-safe ABI definitions

const ENTRY_POINT_ABI = parseAbi([
  "function getNonce(address sender, uint192 key) view returns (uint256 nonce)",
]);

/**
 * Creates a custom smart account object that is compatible with viem/permissionless
 * and knows how to interact with your specific AccountFactory contract.
 *
 * @param client A Viem Public Client for reading from the blockchain.
 * @param owner The EIP-1193 provider from the user's wallet (e.g., Privy).
 * @param factoryAddress The address of your deployed AccountFactory.
 * @param userNonce A unique number to generate a deterministic address for the user.
 * @returns A fully configured Smart Account object.
 */
export async function toCustomSmartAccount({
  client,
  owner,
  factoryAddress,
  userNonce = 0n,
}: {
  client: Client;
  owner: EIP1193Provider; // Use Viem's `Transport` type for any EIP-1193 provider
  factoryAddress: Address;
  userNonce?: bigint;
}) {
  // Get the address of the wallet that will own the smart account
  const ownerAddress = (
    await owner.request({ method: "eth_accounts" })
  )[0] as Address;
  const walletClient = createWalletClient({
    transport: custom(owner),
    chain: baseSepolia,
  });

  const smartAccount = await toSmartAccount({
    client: walletClient,
    entryPoint: {
      abi: [
        /* ... */
      ],
      address: entryPoint06Address,
      version: "0.6",
    },

    // This function tells viem how to calculate the smart account's address
    async getAddress() {
      return publicClient.readContract({
        address: factoryAddress,
        abi: ACCOUNT_FACTORY_ABI,
        functionName: "getAddressForUser",
        args: [ownerAddress, userNonce],
      });
    },
    async getStubSignature(): Promise<Hex> {
      // Useful for bundler simulation; can return "0x" if not used
      return "0x";
    },

async signMessage({
  message,
}: {
  message: string | { raw: Hex | Uint8Array };
}): Promise<Hex> {
  const messageToSign =
    typeof message === 'string'
      ? message
      : typeof message.raw === 'string'
      ? message.raw
      : bytesToHex(message.raw);

  return owner.request({
    method: 'personal_sign',
    params: [messageToSign, ownerAddress],
  });
},

    async signTypedData(typedData: any): Promise<Hex> {
      return owner.request({
        method: "eth_signTypedData_v4",
        params: [ownerAddress, JSON.stringify(typedData)],
      });
    },

    // This function tells the bundler how to deploy the account if it doesn't exist yet
    async getFactoryArgs() {
      return {
        factoryAddress: factoryAddress,
        factoryData: encodeFunctionData({
          abi: ACCOUNT_FACTORY_ABI,
          functionName: "createAccount",
          args: [userNonce],
        }),
      };
    },

    // This function encodes single or batch transactions into the format
    // your `SmartAccount.sol` contract's `execute` or `executeBatch` functions expect.
    async encodeCalls(calls) {
      if (calls.length === 0) {
        throw new Error("No calls provided.");
      }
      const [call] = calls;
      return encodeFunctionData({
        abi: SMART_ACCOUNT_ABI,
        functionName: "execute",
        args: [call.to, call.value ?? 0n, call.data ?? "0x"],
      });
    },

    // This function signs the UserOperation hash using the owner's wallet
    async signUserOperation(
      params: UnionPartialBy<UserOperation<EntryPointVersion>, "sender"> & {
        chainId?: number;
      }
    ): Promise<Hex> {
      const {
        chainId = client.chain!.id,
        sender: _unused, // ignore incoming sender if any
        ...userOpPartial
      } = params;

      const userOp: UserOperation<EntryPointVersion> = {
        ...userOpPartial,
        sender: ownerAddress,
        // Note: do NOT include chainId as a prop here
      };

      const userOpHash = getUserOperationHash({
        userOperation: userOp,
        entryPointAddress: entryPoint06Address,
        entryPointVersion: "0.6",
        chainId,
      });

      return owner.request({
        method: "personal_sign",
        params: [userOpHash, ownerAddress],
      });
    },
  });

  return smartAccount;
}
