"use client";
import {
  useWriteContract,
  useAccount,
  useTransactionReceipt,
  useReadContract,
} from "wagmi";
import {
  SMART_ACCOUNT_ABI,
  ACCOUNT_FACTORY_ABI,
  CONTRACT_ADDRESSES,
} from "../lib/contracts";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useState } from "react";
import { useAddressStore } from "../lib/store/addressStore";
import { DeploymentState } from "../types/types";
import { toast } from "sonner";
import { useWalletAutoFunder } from "@/components/autoFund";
import { set } from "lodash";

/*************************************************************************/
/** 🧩 TYPES *************************************************************/
/*************************************************************************/
type FundingStatus =  "checking" | "funding" | "funded" | "error" | "not funded";

export function useDeploySmartAccount() {
  /*************************************************************************/
  /** 🧠 STATES ***********************************************************/
  /*************************************************************************/
  const [deploymentState, setDeploymentState] = useState<DeploymentState>({
    accountStep: "idle",
    accountError: undefined,
  });
  const [fundingStatus, setFundingStatus] = useState<FundingStatus>("checking");

  /*************************************************************************/
  /** 🪝 WAGMI / OTHER HOOKS **********************************************/
  /*************************************************************************/
  const {
    ready,
    user,
    authenticated,
    login,
    connectWallet,
    logout,
    linkWallet,
  } = usePrivy();

  const { fundWallet, walletStatus, walletAddress } = useWalletAutoFunder();

  const router = useRouter();
  const { address, isConnected } = useAccount();

  const {
    data: createAccountHash,
    writeContract: writeCreateAccount,
    error: createAccountError,
  } = useWriteContract();

  const { isSuccess: isAccountTxSuccess, error: isAccountTxError } =
    useTransactionReceipt({ hash: createAccountHash });

  const { data: factoryOwner, error: factoryError } = useReadContract({
    address: CONTRACT_ADDRESSES.ACCOUNT_FACTORY as `0x${string}`,
    abi: ACCOUNT_FACTORY_ABI,
    functionName: "s_owner",
    query: {
      enabled: !!CONTRACT_ADDRESSES.ACCOUNT_FACTORY,
    },
  });

  const {
    data: smartAccount,
    error: smartAccountError,
    refetch: smartAccountRefetch,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.ACCOUNT_FACTORY as `0x${string}`,
    abi: ACCOUNT_FACTORY_ABI,
    functionName: "getUserClone",
    args: [address!],
    query: {
      enabled: !!address && !!factoryOwner,
    },
  });

  const { data: taskManager, refetch: taskManagerRefetch } = useReadContract({
    address: smartAccount as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    functionName: "taskManager",
    query: {
      enabled:
        !!smartAccount &&
        smartAccount !== "0x0000000000000000000000000000000000000000",
    },
  });

  /*************************************************************************/
  /** 🛠 CUSTOM HOOKS *****************************************************/
  /*************************************************************************/
  const setAccountAddress = useAddressStore(
    (state) => state.setSmartAccountAddress
  );
  const setTaskManagerAddress = useAddressStore(
    (state) => state.setTaskManagerAddress
  );

  /*************************************************************************/
  /** 💰 FUNDING LOGIC ****************************************************/
  /*************************************************************************/

  /*************************************************************************/
  /** 🚀 ACTION METHODS ***************************************************/
  /*************************************************************************/
  async function createAccount() {
    const nonce = BigInt(0);
    if (!address) {
      setDeploymentState((prev) => ({
        ...prev,
        accountStep: "error",
        accountError: "WALLET NOT CONNECTED",
      }));
      toast.error("WALLET NOT CONNECTED");
      console.log("ERROR:WALLET NOT CONNECTED");
      return;
    }
    if (!factoryOwner) {
      setDeploymentState((prev) => ({
        ...prev,
        accountStep: "error",
        accountError: "ACCOUNT FACTORY NOT FOUND OR INVALID",
      }));
      toast.error("ACCOUNT FACTORY NOT FOUND OR INVALID");
      console.log("ERROR:ACCOUNT FACTORY NOT FOUND OR INVALID");
      return;
    }
    setDeploymentState((prev) => ({ ...prev, accountStep: "creating" }));

    try {
      await writeCreateAccount({
        address: CONTRACT_ADDRESSES.ACCOUNT_FACTORY as `0x${string}`,
        abi: ACCOUNT_FACTORY_ABI,
        functionName: "createAccount",
        args: [nonce],
      });
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
    setFundingStatus("checking");
  };

  const isSmartAccount =
    smartAccount &&
    smartAccount !== "0x0000000000000000000000000000000000000000";

  /*************************************************************************/
  /** 📡 SIDE EFFECTS *****************************************************/
  /*************************************************************************/

  // Handle smart account creation success
  useEffect(() => {
    if (isAccountTxSuccess || isSmartAccount) {
      setDeploymentState((prev) => ({
        ...prev,
        accountStep: "created",
      }));

      async function refetchData() {
        const { data: smartAccountData } = await smartAccountRefetch();
        const { data: taskManagerData } = await taskManagerRefetch();
        setAccountAddress(smartAccountData as `0x${string}`);
        setTaskManagerAddress(taskManagerData as `0x${string}`);
      }

      refetchData();
    }
  }, [isAccountTxSuccess, smartAccount]);

  // Handle smart account creation errors
  useEffect(() => {
    if (isAccountTxError || createAccountError) {
      setDeploymentState((prev) => ({
        ...prev,
        accountStep: "error",
        accountError: `ACCOUNT CREATION FAILED`,
      }));
    }
  }, [createAccountError, isAccountTxError]);

    async function fundWalletOp() {
      try {
        const statusData= await fundWallet();
        if (statusData) {
          const { response, result } = statusData;
          if (response.ok) {
            if (result.success==true) {
              setFundingStatus("funded")
            }else{
              setFundingStatus("error")
            }
          }else{
          setFundingStatus("error");
        }
        }else{
          setFundingStatus("error");
        }
      } catch (error) {
        toast.error("An unexpected error occurred while checking wallet status.");
        setFundingStatus("error")
      }
    }
 
      async function checkWalletStatus() {
        
      try {
        const statusData= await walletStatus();
        if (statusData) {
          const { response, result } = statusData;
          if (response.ok) {
            if (result.success==true) {
              setFundingStatus("funded")
            }else{
              setFundingStatus("not funded")
            }
          }else{
          setFundingStatus("error");
        }
        }else{
          setFundingStatus("error");
        }
      } catch (error) {
        toast.error("An unexpected error occurred while checking wallet status.");
        setFundingStatus("error")
      }
    }
  useEffect(() => {
    if (ready && authenticated && walletAddress){
      checkWalletStatus()
    }
  }, [ready, authenticated, walletAddress]);

  /*************************************************************************/
  /** 🎯 RETURN API *******************************************************/
  /*************************************************************************/
  return {
    // Smart Account Data
    smartAccount,
    taskManager,
    factoryOwner,
    deploymentState,

    // Wallet Connection
    isConnected,
    address,
    walletAddress,

    // Actions
    createAccount,
    resetAccount,
    connectWallet,
    logout,

    // Privy Auth
    ready,
    user,
    authenticated,

    // // Funding Status
    fundingStatus,
    fundWalletOp,
    checkWalletStatus


    // // Manual Actions
    // fundWallet: handleWalletFunding,
  };
}
