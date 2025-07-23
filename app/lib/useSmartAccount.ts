import {  useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getSmartAccountClient } from "./smartAccountClient";
import { SmartAccountClient } from "permissionless";


export function useSmartAccount() {
  const [smartAccountClient, setSmartAccountClient] =
    useState<SmartAccountClient | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { ready, authenticated, user } = usePrivy();
  const embeddedWallet = user?.wallet;
  useEffect(() => {
    if (!ready || !authenticated || !embeddedWallet) return;
    const init = async () => {
        setIsLoading(true)
        try {
            const client= await getSmartAccountClient(embeddedWallet);
            setSmartAccountClient(client);
            setSmartAccountAddress(client.account.address);
        } catch (error) {
            setError(error as Error);
            console.log(error)
        } finally{
            setIsLoading(false)
        }
    };
    init();
  }, [ready, authenticated, embeddedWallet]);
    return {
    smartAccountClient,
    smartAccountAddress,
    isLoading,
    error,
  };
}
