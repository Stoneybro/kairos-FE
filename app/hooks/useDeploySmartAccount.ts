"use client";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useAddressStore } from "../lib/store/addressStore";
import { DeploymentState } from "../types/types";
import { toast } from "sonner";
import { useSmartAccount } from "../lib/useSmartAccount";
import { publicClient } from "../lib/pimlico";
/*************************************************************************/
/** 🧩 TYPES *************************************************************/
/*************************************************************************/

export function useDeploySmartAccount() {
  /*************************************************************************/
  /** 🧠 STATES ***********************************************************/
  /*************************************************************************/
  const [deploymentState, setDeploymentState] = useState<DeploymentState>({
    accountStep: "idle",
    accountError: undefined,
  });
  const [isAccountDeployedLoading, setIsAccountDeployedLoading] = useState(false)
  const [debug, setDebug] = useState(false);
  /*************************************************************************/
  /** 🪝 WAGMI / OTHER HOOKS **********************************************/
  /*************************************************************************/
  const { smartAccountClient, smartAccountAddress, isLoading, error } =
    useSmartAccount();
  const { ready, user, authenticated, login, connectWallet, logout } =
    usePrivy();

  const router = useRouter();
  const { address, isConnected } = useAccount();

  /*************************************************************************/
  /** 🛠 CUSTOM HOOKS *****************************************************/
  /*************************************************************************/
  const setAccountAddress = useAddressStore(
    (state) => state.setSmartAccountAddress
  );


  /*************************************************************************/
  /** 🚀 ACTION METHODS ***************************************************/
  /*************************************************************************/
  async function createAccount() {
    if (!address || !smartAccountClient || !smartAccountClient.account || !smartAccountAddress) {
      setDeploymentState((prev) => ({
        ...prev,
        accountStep: "error",
        accountError: "Client not ready or wallet not connected.",
      }));
      toast.error("Client not ready or wallet not connected.");
      return;
    }

    setDeploymentState((prev) => ({ ...prev, accountStep: "creating" }));

    try {
      const hash = await smartAccountClient.sendUserOperation({
        calls: [
          {
            to: smartAccountAddress,
            data: "0x", 
            value: 0n,
          },
        ],
      });


      await smartAccountClient.waitForUserOperationReceipt({ hash });

      setDeploymentState((prev) => ({
        ...prev,
        accountStep: "created",
      }));
    } catch (error) {
      console.log(error);
      toast.error(
        `ACCOUNT CREATION FAILED: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      );
      setDeploymentState((prev) => ({
        ...prev,
        accountStep: "error",
        accountError: `ACCOUNT CREATION FAILED ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      }));
    }
  }
  const resetAccount = () => {
    setDeploymentState((prev) => ({
      ...prev,
      accountStep: "idle",
      accountError: undefined,
    }));
  };

  /*************************************************************************/
  /** 📡 SIDE EFFECTS *****************************************************/
  /*************************************************************************/
  useEffect(() => {
    if (!smartAccountClient || !smartAccountAddress || !isLoading) return;

    const check = async () => {
      setIsAccountDeployedLoading(true)
      try {
        const code = await publicClient.getCode({
          address: smartAccountAddress,
        });
        if (code !== "0x") {
          setDeploymentState((prev) => ({
            ...prev,
            accountStep: "created",
          }));
        }
      } catch (err:any) {
        console.error("Error fetching contract code:", err.message);
      } finally {
        setDeploymentState((prev) => ({
          ...prev,
        }));
      }
      setAccountAddress(smartAccountAddress as `0x${string}`);
    };
    check();
  }, [smartAccountClient, smartAccountAddress, isLoading]);


  /*************************************************************************/
  /** 🎯 RETURN API *******************************************************/
  /*************************************************************************/
  return {
    smartAccountAddress,
    deploymentState,
    isAccountDeployedLoading,
    createAccount,
    debug,
    setDebug,
    login,
    connectWallet,
    logout,
    ready,
    user,
    authenticated,
  };

}
