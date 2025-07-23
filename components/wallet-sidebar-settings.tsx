"use client"
import { Loader2, LogOut } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { usePrivy,useWallets } from '@privy-io/react-auth';
import { anvil,baseSepolia } from 'viem/chains';
import { ThemeToggle } from './theme-switcher';
import { useRouter } from 'next/navigation';
import { useDisconnect } from 'wagmi';
import { useAddressStore } from '@/app/lib/store/addressStore';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from './ui/button';
import { toast } from 'sonner';
const WalletSidebarSettings= () => {
  const [logOut,setLogOut]=useState<"LogOut"|"Logging Out">("LogOut")

  /*//////////////////////////////////////////////////////////////*/
  //                               HOOKS
  /*//////////////////////////////////////////////////////////////*/
    const {disconnect}=useDisconnect()
    const {wallets}=useWallets()
    const {logout}=usePrivy()
    const router=useRouter();
  /*//////////////////////////////////////////////////////////////*/
  //                            CUSTOM HOOKS
  /*//////////////////////////////////////////////////////////////*/
  const setAccountAddress = useAddressStore(
    (state) => state.setSmartAccountAddress
  );

  

  /*//////////////////////////////////////////////////////////////*/
  //                           FUNCTIONS
  /*//////////////////////////////////////////////////////////////*/

const wallet=wallets[0];
  async function switchNetwork() {
    if (wallet) {
      try {
        await wallet.switchChain(baseSepolia.id)
        toast.success('Successfully switched to Base network')
        console.log('Successfully switched to Base network');
      } catch (error) {
        toast.error(`Failed to switch network ${error}`)
        console.log('Failed to switch network:', error)
      }
    }
  }
 function handleLogout() {
  setLogOut("Logging Out")
    localStorage.removeItem("address-storage");
  useAddressStore.setState({
    SmartAccountAddress: null,
  });
  logout()

 }
  /*//////////////////////////////////////////////////////////////*/
  //                               JSX
  /*//////////////////////////////////////////////////////////////*/
  return (
    <div className='flex flex-col  h-full w-full p-4'>
      <div className=' text-2xl font-semibold flex justify-start'>
        <div className=''> Settings</div>
      </div>

    
      {/* chains */}
      <div className="flex flex-col gap-2 mt-4 ">
        <div className="">Chain</div>
 <Select>
      <SelectTrigger className="w-[180px]" defaultValue={"anvil"}>
        <SelectValue placeholder="Anvil" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Chains</SelectLabel>
          <SelectItem value="baseSepolia">Base sepolia</SelectItem>
          <SelectItem value="anvil">Anvil</SelectItem>
               </SelectGroup>
      </SelectContent>
    </Select>
      </div>
    {/* theme toggle */}
    <ThemeToggle />
    {/* log out */}
      <button onClick={()=>handleLogout()} className="flex gap-2  px-3 mt-8 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 border   text-destructive items-center cursor-pointer">
       {logOut==="Logging Out" && <Loader2 className='animate-spin' />}
        {logOut}
        <LogOut className='h-3 w-3' />
      </button >

    </div>
  );
};

export default WalletSidebarSettings;