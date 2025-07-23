import React, { useState, useEffect } from 'react';
import { activeTabType } from '@/app/types/types';
import { useDashboard } from '@/app/hooks/useDashboard';
import { ArrowUpDown, QrCode } from 'lucide-react';
import { formatEther } from 'viem';
type tabType = {
setTab: (state: activeTabType) => void;
};
const WalletSIdebarHome= ({setTab}: tabType) => {



  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                            CUSTOM HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const { availableBalance, smartAccountAddress, formattedPersonalBalance, accountBalance,commitedFunds } = useDashboard();

  /*//////////////////////////////////////////////////////////////*/
  //                           FUNCTIONS
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (

      <div className='flex-1 flex flex-col items-center justify-center px-6'>
        <div className='text-center mb-8'>
          <div className='text-4xl font-light mb-2'>
            <span className='text-white'>{Number(formatEther(availableBalance)).toFixed(2)}</span>
            <span className=' text-muted-foreground text-lg ml-1'>ETH</span>
          </div>
          <div className='text-sm  text-muted-foreground'>Available Balance</div>
        </div>

        {/* Additional Balance Info */}
        <div className='w-full max-w-sm mb-8 space-y-3'>
          <div className='bg-muted/50 rounded-lg p-3 flex justify-between items-center'>
            <span className=' text-muted-foreground text-sm'>Total Balance</span>
            <span className='text-white text-sm'>{Number(accountBalance).toFixed(3)}ETH</span>
          </div>
          <div className='bg-muted/50 rounded-lg p-3 flex justify-between items-center'>
            <span className=' text-muted-foreground text-sm'>Committed</span>
            <span className='  text-sm'>{Number(commitedFunds).toFixed(3)}ETH</span>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className='w-full max-w-sm space-y-4'>
          {/* Top Row */}
          <button onClick={()=>setTab("receive")} className='bg-muted/50 w-full hover:bg-muted transition-colors rounded-xl p-4 flex items-center justify-center space-x-3'>
            <QrCode className='w-5 h-5 text-white' />
            <span className='text-white font-medium'>receive</span>
          </button>
          <div className='grid grid-cols-2 gap-4'>
            <button onClick={()=>setTab("deposit")} className='bg-muted/50 hover:bg-muted transition-colors rounded-xl p-4 flex items-center justify-center space-x-3'>
              <div className='w-6 h-6 bg-white rounded flex items-center justify-center'>
                <div className='w-3 h-3 bg-gray-900 rounded'></div>
              </div>
              <span className='text-white font-medium'>Deposit</span>
            </button>

            <button onClick={()=>setTab("send")} className='bg-muted/50 hover:bg-muted transition-colors rounded-xl p-4 flex items-center justify-center space-x-3'>
              <ArrowUpDown className='w-6 h-6 ' />
              <span className=' font-medium'>Send</span>
            </button>
          </div>
        </div>

        {/* Bottom Text */}
      </div>

  );
};

export default WalletSIdebarHome;