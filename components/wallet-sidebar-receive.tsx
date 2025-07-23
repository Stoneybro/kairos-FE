import React, { useState, useEffect } from 'react';
import {QRCodeCanvas} from "qrcode.react"
import { Copy } from 'lucide-react';
import { useDashboard } from '@/app/hooks/useDashboard';

const WalletSIdebarReceive= () => {
  /*//////////////////////////////////////////////////////////////*/
  //                               STATES
  /*//////////////////////////////////////////////////////////////*/
  const {smartAccountAddress,copyToClipboard,truncateAddress}=useDashboard();
  const qrValue = `ethereum:${smartAccountAddress}`
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
    <div className='flex flex-col p-4 w-full justify-center items-center'>
          <QRCodeCanvas value={qrValue} size={250} className=' border-accent-foreground border-2 rounded-xl' />
             <div className='bg-muted   rounded-lg mt-5 p-3 flex justify-between items-center w-full cursor-pointer'>
                 <span className=' '>{truncateAddress(smartAccountAddress ?? "",7,7)}</span>
                  <Copy
                       className='w-4 h-4  cursor-pointer hover:text-white transition-colors'
                       onClick={() => copyToClipboard(smartAccountAddress ?? "")}
                     />
               </div>
       </div>
  );
};

export default WalletSIdebarReceive;