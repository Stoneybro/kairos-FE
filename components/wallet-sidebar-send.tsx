import { useDashboard } from '@/app/hooks/useDashboard';
import { SMART_ACCOUNT_ABI } from '@/app/lib/contracts';
import { useAddressStore } from '@/app/lib/store/addressStore';
import { useDataStore } from '@/app/lib/store/dataStore';
import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { isAddress, parseEther } from 'viem';
import { useWriteContract, useReadContract, useTransactionReceipt, useAccount } from 'wagmi';
type SendType = "Send" | "Sending" | "Sent";
const WalletSidebarSend= () => {
  /*//////////////////////////////////////////////////////////////*/
  //                               STATES
  /*//////////////////////////////////////////////////////////////*/
    const [amount, setAmount] = useState<string>("");
    const [addressto, setAddressto] = useState<string>("");
    const [sendButton, setsendButton] = useState<SendType>("Send");
  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const { data: useSendHash, writeContract: useWriteSend } = useWriteContract();
  const {  isSuccess,isError } = useTransactionReceipt({ hash: useSendHash });
  const { address } = useAccount();
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
  const {accountBalance}=useDashboard()
  /*//////////////////////////////////////////////////////////////*/
  //                            CONTRACT WRITES
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                            CONTRACT READS
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                           FUNCTIONS
  /*//////////////////////////////////////////////////////////////*/
  async function send(value: string) {
    try {
      await useWriteSend({
        address: SimpleAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "transfer",
        args: [addressto as `0x${string}`, parseEther(amount)],
      });
    } catch (error) {
      console.log(error);
    }
  }
  const handlesend = async () => {
    setsendButton("Sending");
    await send(amount);
  };
  const isInvalid =
    amount.trim() === "" ||
    isNaN(Number(amount)) ||
    Number(amount) <= 0 ||
    !/^\d*\.?\d*$/.test(amount) ||
    !isAddress(addressto) ||
    sendButton === "Sent" ||
    sendButton === "Sending" ||
    amount >accountBalance ;
  useEffect(() => {
    if (isSuccess) {
      setsendButton("Sent");
      refetchBalance?.();
      refetchCommittedFunds?.();
      toast.success(`Sent ${amount} ETH to ${addressto} successfully`)
    }
    if (isError) {
      toast.error("Sending Failed")
    }
  }, [isSuccess,isError]);
  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (

         <div className='p-4 flex flex-col w-full h-full gap-4 mt-12'>
      <div className='flex flex-col gap-2 w-full'>
        <div className='flex items-center justify-between'>
          <label htmlFor='Addressto' className='text-muted-foreground text-sm'>
            Send to
          </label>
          <button
            className='text-xs text-muted-foreground bg-main p-2 rounded-lg cursor-pointer'
            onClick={() => setAddressto(address as `0x${string}`)}
          >
            YOUR WALLET
          </button>
        </div>
        <input
          value={addressto}
          onChange={(e) => {
            setAddressto(e.target.value);
            setsendButton("Send");
          }}
          type='text'
          name='Addressto'
          className='bg-main w-full p-2 rounded  '
        />
      </div>
      <div className='flex flex-col gap-2 w-full'>
        <label htmlFor='amount' className='text-muted-foreground text-sm'>
          Amount
        </label>
        <input
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setsendButton("Send");
          }}
          type='text'
          placeholder='0'
          name='amount'
          className='bg-main w-full p-2 rounded  '
        />
        {amount > accountBalance && (
          <div className='text-red-500 text-xs'>
            amount is more than available balance
          </div>
        )}
        <div className='text-muted-foreground self-end text-xs'>
          Balance: {Number(accountBalance).toFixed(3)} ETH
        </div>
      </div>
      <button
        disabled={isInvalid}
        onClick={handlesend}
        className={`${
          isInvalid ? "bg-muted-foreground cursor-pointer" : "bg-white"
        } text-black rounded w-full px-3 py-2 flex gap-[1px] items-center justify-center`}
      >
        {sendButton === "Sending" && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        {sendButton}
      </button>
    </div>
  );
};

export default WalletSidebarSend;