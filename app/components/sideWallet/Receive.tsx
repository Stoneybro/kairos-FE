import React, { useState, useEffect } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import {QRCodeCanvas} from "qrcode.react"
import { Copy } from 'lucide-react';
type addressType={address:`0x${string}` | null}
const Receive= (address:addressType) => {

  /*//////////////////////////////////////////////////////////////*/
  //                               TYPES
  /*//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////*/
  //                               STATES
  /*//////////////////////////////////////////////////////////////*/
  const qrValue = `ethereum:${address}`
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
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
    function truncateAddress(address: string, start = 6, end = 4) {
      if (!address) return "";
      return `${address.slice(0, start)}...${address.slice(-end)}`;
    }

  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (
    <div className='flex flex-col p-4 w-full justify-center items-center'>
       <QRCodeCanvas value={qrValue} size={200} />
          <div className='bg-main   rounded-lg mt-5 p-3 flex justify-between items-center w-full cursor-pointer'>
              <span className=' '>{truncateAddress(address.address ?? "",7,5)}</span>
               <Copy
                    className='w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors'
                    onClick={() => copyToClipboard(address.address ?? "")}
                  />
            </div>
    </div>
  );
};

export default Receive;