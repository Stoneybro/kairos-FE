"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useDeploySmartAccount } from "./hooks/useDeploySmartAccount";
import {
  GalleryVerticalEnd,
  Loader2,
  CircleCheckBig,
  Wallet,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/login-form";
import { useDashboard } from "./hooks/useDashboard";
import { useWalletAutoFunder } from "@/components/autoFund";

export default function Home() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { smartAccount, deploymentState, createAccount, authenticated, fundingStatus,fundWalletOp,checkWalletStatus } =
    useDeploySmartAccount();
  const { copyToClipboard } = useDashboard();

  const getLabel = () => {
    switch (deploymentState.accountStep) {
      case "creating":
        return "ACTIVATING WALLET";
      case "created":
        return "WALLET ACTIVE";
      default:
        return "ACTIVATE WALLET";
    }
  };

  const getFundingLabel = () => {
    switch (fundingStatus) {
      case "funding":
        return "Funding wallet";
      case "funded":
        return "Wallet funded";
      case "error":
        return "error:retry";
      case "not funded":
        return "wallet not funded"
      default:
        return "Checking wallet balance...";
    }
  };

  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <a href='#' className='flex font-bold text-lg'>
            Kairos
          </a>
          {address && (
            <Button
              onClick={() => copyToClipboard(address)}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Wallet className='h-4 w-4' />
              {address.slice(0, 6)}...{address.slice(-4)}
              <Copy className='h-4 w-4 ml-2' />
            </Button>
          )}
        </div>

        {/* Body */}
        <div className='flex my-auto items-center justify-center'>
          <div className='w-full max-w-sm'>
            {!authenticated ? (
              <LoginForm />
            ) : (
              <div className='bg-background flex flex-col justify-center items-center gap-8 text-center'>
                <div className='text-4xl'>Activate Your Kairos Wallet (Demo)</div>
                <div>
                  This is a secure smart wallet, unique to you, where your
                  locked funds are held safely while you work on your tasks.
                </div>
                <div>
                  Activating your wallet is a blockchain transaction and will
                  require a small gas fee. New testers Can obtain funds for testing by clicking the button below.
                </div>

                {getFundingLabel() ==="wallet not funded"?<Button onClick={()=>fundWalletOp()}>Fund wallet</Button>:(getFundingLabel() === "error:retry"?<Button onClick={()=>checkWalletStatus()}>Error: Refresh</Button>:<Button variant='outline'>{getFundingLabel()}</Button>)}

                {/* Wallet Activation Button */}
                <button
                  disabled={
                    !isConnected ||
                    deploymentState.accountStep === "creating" ||
                    deploymentState.accountStep === "created"
                  }
                  className={`bg-white px-5 py-2 text-black rounded flex items-center justify-center ${
                    !isConnected ||
                    deploymentState.accountStep === "creating" ||
                    deploymentState.accountStep === "created"
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  onClick={createAccount}
                >
                  {deploymentState.accountStep === "creating" && (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  )}
                  {deploymentState.accountStep === "created" && (
                    <CircleCheckBig className='mr-2 h-4 w-4' />
                  )}
                  {getLabel()}
                </button>

                {/* Post-Activation Wallet Funding */}
                {deploymentState.accountStep === "created" && fundingStatus=="funded" && (
                  <div>
                   
                      <Button
                        onClick={() => router.push("/dashboard")}
                        variant='outline'
                      >
                        Go to dashboard
                      </Button>
                    
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className='bg-muted relative hidden lg:block'></div>
    </div>
  );
}
