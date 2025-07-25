"use client";

import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useDeploySmartAccount } from "./hooks/useDeploySmartAccount";
import { GalleryVerticalEnd, Loader2, CircleCheckBig } from "lucide-react";
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
  const { isConnected, address } = useAccount();
  /*//////////////////////////////////////////////////////////////
                            CUSTOM HOOKS
//////////////////////////////////////////////////////////////*/
  const {
    smartAccountAddress,
    deploymentState,
    createAccount,
    debug,
    setDebug,
    authenticated,
  } = useDeploySmartAccount();

  /*//////////////////////////////////////////////////////////////
                            FUNCTIONS
//////////////////////////////////////////////////////////////*/

  const getLabel = () => {
    switch (deploymentState.accountStep) {
      case "creating":
        return "CREATING WALLET";
      case "created":
        return "WALLET CREATED";
      default:
        return "CREATE WALLET";
    }
  };
  // useEffect(() => {
  //   if (authenticated && smartAccount && taskManager) {
  //       router.push("/dashboard");
  //   }
  // }, [authenticated, smartAccount, taskManager]);

  /*//////////////////////////////////////////////////////////////
                            JSX
//////////////////////////////////////////////////////////////*/


  return (
    <>
      <div className='grid min-h-svh lg:grid-cols-2'>
        <div className='flex flex-col gap-4 p-6 md:p-10'>
          <div className='flex justify-center gap-2 md:justify-start'>
            <a href='#' className='flex items-center gap-2 font-medium'>
              <div className='bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md'>
                <GalleryVerticalEnd className='size-4' />
              </div>
              Kairos
            </a>
          </div>
          <div className='flex  items-center justify-center'>
            <div className='w-full max-w-sm'>
              {!authenticated ? (
                <LoginForm />
              ) : (
                <div className='bg-background min-h-[90vh] flex flex-col items-center justify-center  relative'>
                  <div className='bg-background flex flex-col justify-center items-center gap-8 text-center'>
                    <div className=' text-4xl'>Create Your Kairos Wallet</div>
                    <div className=''>
                      This is a secure smart wallet, unique to you, where your
                      locked funds are held safely while you work on your tasks.
                    </div>
                    <div className=''>
                      Creating your wallet is a blockchain transaction and will
                      require a small gas fee.
                    </div>
                    <Button variant={"link"}>click here to get some</Button>
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

                    {deploymentState.accountStep === "created" && (
                      <div className="">
                          <div className='text-sm text-gray-400'>
                        Your Kairos wallet Address: [ {smartAccountAddress} ]
                      </div>
                      
                      </div>
                    
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='bg-muted relative hidden lg:block'></div>
      </div>
    </>
  );
}