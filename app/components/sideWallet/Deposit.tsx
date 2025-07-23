import { useAddressStore } from "@/app/lib/store/addressStore";
import { useDataStore } from "@/app/lib/store/dataStore";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { parseEther } from "viem";
import { useWriteContract, useReadContract, useSendTransaction } from "wagmi";
type balanceType = {
  balance: string;
};

const Deposit = (balance: balanceType) => {
  /*//////////////////////////////////////////////////////////////*/
  //                               TYPES
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const { sendTransaction, isSuccess } = useSendTransaction();

  /*//////////////////////////////////////////////////////////////*/
  //                               STATES
  /*//////////////////////////////////////////////////////////////*/
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
  /*//////////////////////////////////////////////////////////////*/
  //                            CONTRACT WRITES
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                            CONTRACT READS
  /*//////////////////////////////////////////////////////////////*/

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
      console.log(error);
    }
  }

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
    amount >balance.balance;


  
  useEffect(() => {
    if (isSuccess) {
      setDepositButton("Deposited");
      refetchBalance?.();
      refetchCommittedFunds?.();
    }
  }, [isSuccess]);

  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (
    <div className='p-4 flex flex-col w-full h-full gap-4 mt-12'>
      <div className='flex flex-col gap-2 w-full'>
        <label htmlFor='amount' className='text-gray-400 text-sm'>
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
          className='bg-main w-full p-2 rounded  '
        />
        <div className='text-gray-400 self-end text-xs'>
          Balance: {Number(balance.balance).toFixed(3)} ETH
        </div>
      </div>
      <button
        disabled={isInvalid }
        onClick={handleDeposit}
        className={`${
          isInvalid ? "bg-button-secondary" : "bg-white"
        } text-black rounded w-full px-3 py-2 flex gap-[1px] items-center justify-center`}
      >
        {depositButton === "Depositing" && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        {depositButton}
      </button>
    </div>
  );
};

export default Deposit;
