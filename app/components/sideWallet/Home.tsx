"use client";
import { useState } from "react";
import { X, Copy, ArrowUpDown, Send, QrCode, ChevronDown } from "lucide-react";
import { formatEther } from "viem";
import { useUiStore } from "../../lib/store/UIStore";
import { useAddressStore } from "../../lib/store/addressStore";
/*//////////////////////////////////////////////////////////////*/
//                               TYPES
/*//////////////////////////////////////////////////////////////*/
type activeTabType =
  | "home"
  | "activity"
  | "settings"
  | "receive"
  | "deposit"
  | "send";
type propType = {
  fund: bigint | string;
  balance: bigint | string;
  setTab: (state: activeTabType) => void;
};
const Home = ({ fund, balance, setTab }: propType) => {
  const SimpleAccountAddress = useAddressStore(
    (state) => state.SmartAccountAddress
  );
  const availableBalance = Number(balance) - Number(fund);

  /*//////////////////////////////////////////////////////////////*/
  //                               STATES
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                            CUSTOM HOOKS
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                            CONTRACT WRITES
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                            CONTRACT READS
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                           FUNCTIONS
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (
    <div>
      <div className='flex-1 flex flex-col items-center justify-center px-6'>
        <div className='text-center mb-8'>
          <div className='text-4xl font-light mb-2'>
            <span className='text-white'>{availableBalance.toFixed(2)}</span>
            <span className='text-gray-400 text-lg ml-1'>ETH</span>
          </div>
          <div className='text-sm text-gray-400'>Available Balance</div>
        </div>

        {/* Additional Balance Info */}
        <div className='w-full max-w-sm mb-8 space-y-3'>
          <div className='bg-main rounded-lg p-3 flex justify-between items-center'>
            <span className='text-gray-400 text-sm'>Total Balance</span>
            <span className='text-white text-sm'>{Number(balance).toFixed(3)}ETH</span>
          </div>
          <div className='bg-main rounded-lg p-3 flex justify-between items-center'>
            <span className='text-gray-400 text-sm'>Committed</span>
            <span className='text-gray-400 text-sm'>{Number(fund).toFixed(3)}ETH</span>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className='w-full max-w-sm space-y-4'>
          {/* Top Row */}
          <button onClick={()=>setTab("receive")} className='bg-main w-full hover:bg-gray-700 transition-colors rounded-xl p-4 flex items-center justify-center space-x-3'>
            <QrCode className='w-5 h-5 text-white' />
            <span className='text-white font-medium'>receive</span>
          </button>
          <div className='grid grid-cols-2 gap-4'>
            <button onClick={()=>setTab("deposit")} className='bg-main hover:bg-gray-700 transition-colors rounded-xl p-4 flex items-center justify-center space-x-3'>
              <div className='w-6 h-6 bg-white rounded flex items-center justify-center'>
                <div className='w-3 h-3 bg-gray-900 rounded'></div>
              </div>
              <span className='text-white font-medium'>Deposit</span>
            </button>

            <button onClick={()=>setTab("send")} className='bg-main hover:bg-gray-700 transition-colors rounded-xl p-4 flex items-center justify-center space-x-3'>
              <ArrowUpDown className='w-6 h-6 ' />
              <span className=' font-medium'>Send</span>
            </button>
          </div>
        </div>

        {/* Bottom Text */}
      </div>
    </div>
  );
};

export default Home;
