"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useDeploySmartAccount } from "./hooks/useDeploySmartAccount";
import { GalleryVerticalEnd, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/login-form";
/*//////////////////////////////////////////////////////////////
                                TYPES
//////////////////////////////////////////////////////////////*/

export default function Home() {
  /*//////////////////////////////////////////////////////////////
                                STATES
//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////
                           HOOKS
//////////////////////////////////////////////////////////////*/
  const router = useRouter();
  const { isConnected,address } = useAccount();
  /*//////////////////////////////////////////////////////////////
                            CUSTOM HOOKS
//////////////////////////////////////////////////////////////*/
  const {
    smartAccountAddress,
    deploymentState,
    createAccount,
    debug,
    setDebug,
    ready,
    user,
    authenticated,
    login,
    connectWallet,
    logout,
  } = useDeploySmartAccount();

  /*//////////////////////////////////////////////////////////////
                            FUNCTIONS
//////////////////////////////////////////////////////////////*/

  const getLabel = () => {
    switch (deploymentState.accountStep) {
      case "creating":
        return "CREATING ACCOUNT";
      case "created":
        return "ACCOUNT CREATED";
      default:
        return "CREATE ACCOUNT";
    }
  };
  useEffect(() => {
    if (authenticated && smartAccountAddress) {
        router.push("/dashboard");
    }
  }, [authenticated, smartAccountAddress]);


  /*//////////////////////////////////////////////////////////////
                            JSX
//////////////////////////////////////////////////////////////*/
  return (
    <>


     <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Kairos
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
{ !authenticated?<LoginForm />:   <div className='bg-background min-h-screen flex flex-col items-center justify-center  relative'>
      {debug && (
        <div className='absolute top-4 left-4 bg-tag-expired rounded p-6'>

          <div className=''>
            SImple Account Address:{" "}
            {smartAccountAddress ? smartAccountAddress : "not available"}
          </div>

        </div>
      )}
      <button
        className='absolute bottom-8 right-8 bg-white px-5 py-2 text-black rounded cursor-pointer'
        onClick={() => setDebug(!debug)}
      >
        debug
      </button>
      <div className='bg-background flex flex-col justify-center gap-4  '>
        <Button>{address}</Button>

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
          {getLabel()}
        </button>

        {deploymentState.accountStep === "created" && (
          <div className='text-sm text-gray-400'>
            routing to dashboard, please wait...
          </div>
        )}
      </div>
    </div>}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">

      </div>
    </div>
    </>
  );
}
