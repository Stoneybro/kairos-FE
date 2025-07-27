import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";

export function useWalletAutoFunder() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const [txHash, setTxHash] = useState("");


  const fundWallet = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/fund-wallet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
          userId: user?.id || "anonymous",
        }),
      });

      const result = await response.json();

      return {response,result}

      // Optional: save txHash if result contains it
      if (result?.txHash) {
        setTxHash(result.txHash);
      }
    } catch (error) {
      console.error("❌ fundWallet error:", error);
    }
  };

  const walletStatus = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/check/${walletAddress}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

     return{
        response,result
     }
    } catch (error) {
      console.error("❌ walletStatus error:", error);
    }
  };

  return {
    walletAddress,
    fundWallet,
    walletStatus,
    txHash,

  };
}
