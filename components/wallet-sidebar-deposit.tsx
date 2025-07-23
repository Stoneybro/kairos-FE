import { useDashboard } from "@/app/hooks/useDashboard";
import { useAddressStore } from "@/app/lib/store/addressStore";
import { useDataStore } from "@/app/lib/store/dataStore";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { formatEther, parseEther } from "viem";
import { useTransactionReceipt, useSendTransaction } from "wagmi";

import { Button } from "./ui/button";
import { toast } from "sonner";

const WalletSidebarDeposit = () => {
  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const { data: txData, sendTransaction,isSuccess,isError } = useSendTransaction();

  const [amount, setAmount] = useState<string>("");
  const [depositButton, setDepositButton] = useState<
    "Deposit" | "Depositing" | "Deposited"
  >("Deposit");
  /*//////////////////////////////////////////////////////////////*/
  //                            CUSTOM HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const SimpleAccountAddress = useAddressStore(
    (state) => state.SmartAccountAddress
  );
  const refetchBalance = useDataStore((state) => state.refetchAccountbalance);
  const refetchCommittedFunds = useDataStore(
    (state) => state.refetchCommittedFunds
  );
  const { pWalletBalance } = useDashboard();

  /*//////////////////////////////////////////////////////////////*/
  //                           FUNCTIONS
  /*//////////////////////////////////////////////////////////////*/
  async function deposit(value: string) {
    try {
     await sendTransaction({
        to: SimpleAccountAddress, // your smart contract wallet address
        value: parseEther(value), // or however much ETH
      });
    } catch (error) {
      toast.error("Deposit Failed");
      console.log(error);
    }
  }
  const personalBalance =
    pWalletBalance?.value === undefined
      ? "unavailable"
      : `${formatEther(pWalletBalance?.value)}`;

  const handleDeposit = async () => {
    console.log(isInvalid, "isInvalid");
    setDepositButton("Depositing");
    await deposit(amount);
  };

  const isInvalid =
    amount.trim() === "" ||
    isNaN(Number(amount)) ||
    Number(amount) <= 0 ||
    !/^\d*\.?\d*$/.test(amount) ||
    depositButton === "Depositing" ||
    amount > personalBalance;

  useEffect(() => {
    if (isSuccess) {
      setDepositButton("Deposited");
      refetchBalance?.();
      refetchCommittedFunds?.();
     toast.success(`Deposited ${amount} ETH successfully`);
    }
    if (isError) {
      toast.error("Deposit failed");
    }
  }, [isSuccess, isError]);
  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (
    <div className='p-4 flex flex-col w-full h-full gap-4 mt-12'>
      <div className='flex flex-col gap-2 w-full'>
        <label htmlFor='amount' className=' text-foreground text-sm'>
          Amount
        </label>
        <input
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setDepositButton("Deposit");
          }}
          type='text'
          placeholder='0'
          name='amount'
          className='bg-main w-full p-2 rounded'
        />
        <div className='text-foreground self-end text-xs'>
          Balance: {Number(personalBalance).toFixed(3)} ETH
        </div>
      </div>
      <Button
        variant={"default"}
        disabled={isInvalid}
        onClick={handleDeposit}
        className={`${
          isInvalid ? " bg-accent-foreground" : "bg-white"
        } text-black rounded w-full px-3 py-2 flex gap-[1px] items-center justify-center`}
      >
        {depositButton === "Depositing" && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        {depositButton}
      </Button>
    </div>
  );
};

export default WalletSidebarDeposit;
