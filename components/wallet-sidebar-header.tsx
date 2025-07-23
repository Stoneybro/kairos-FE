"use client";
import React from "react";
import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { useAddressStore } from "@/app/lib/store/addressStore";
import {
  HiChevronLeft,
  HiChevronUpDown,
  HiOutlineChevronDown,
  HiPhoneXMark,
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, X } from "lucide-react";
import { formatUnits } from "viem";
import { useSidebar } from "./ui/sidebar";
import { useDashboard } from "@/app/hooks/useDashboard";
import { activeTabType } from "@/app/types/types";
type tabType = {
  setTab: (state: activeTabType) => void;
};
export function SidebarHeader({
  activeTab,
  setTab,
}: {
  activeTab: activeTabType;
  setTab: (state: activeTabType) => void;
}) {
  /*//////////////////////////////////////////////////////////////
                                HOOKS
//////////////////////////////////////////////////////////////*/
  const [isOpen, setIsOpen] = useState(false);
  const { setOpen, setOpenMobile } = useSidebar();
  const { address } = useAccount();
  const { data, isLoading, isError } = useBalance({
    address,
  });
  /*//////////////////////////////////////////////////////////////
                                CUSTOM HOOKS
//////////////////////////////////////////////////////////////*/
  const SimpleAccountAddress = useAddressStore(
    (state) => state.SmartAccountAddress
  );
  const { copyToClipboard, truncateAddress, accountBalance } = useDashboard();
  /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
//////////////////////////////////////////////////////////////*/

  const formattedBalance = formatUnits(
    data ? data.value : 0n,
    data ? data.decimals : 0
  );
  function handleActiveTab() {
    if (activeTab == "home") {
      setOpen(false);
      setOpenMobile(false);
    } else {
      setTab("home");
    }
  }
  return (
    <div className='flex justify-center items-center h-full w-full'>
      <div className='flex-2 flex items-center justify-center'>
        {
          <Button
            onClick={() => handleActiveTab()}
            variant='secondary'
            className=' rounded-full bg-muted flex items-center justify-center'
          >
            <HiChevronLeft />
          </Button>
        }
      </div>
      <div className='flex-6 flex justify-center '>
        <DropdownMenu onOpenChange={setIsOpen}>
          <DropdownMenuTrigger
            asChild
            className='w-[90%]   rounded-2xl bg-card '
          >
            <Button variant='outline' className=' tracking-wide relative '>
              {truncateAddress(SimpleAccountAddress as string)}
              <HiOutlineChevronDown
                size={10}
                className={`absolute right-2 top-2.5 ml-2 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='lg:w-72 p-2' align='center'>
            <div className='flex flex-col gap-1 p-2'>
              <div className='text-muted-foreground text-sm'>
                Personal Wallet
              </div>
              <div className='flex justify-between '>
                <div className='flex gap-3  items-center '>
                  {truncateAddress(address as `0x${string}`, 4, 4)}
                  <Copy
                    className='w-4 h-4  cursor-pointer hover:text-white transition-colors'
                    onClick={() => copyToClipboard(address as string)}
                  />
                </div>
                <div className=''>
                  {Number(formattedBalance).toFixed(2)} ETH
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-1 p-2'>
              <div className='text-muted-foreground text-sm'>Smart Wallet</div>
              <div className='flex justify-between'>
                <div className='flex gap-3 items-center'>
                  {truncateAddress(SimpleAccountAddress as string, 4, 4)}
                  <Copy
                    className='w-4 h-4  cursor-pointer hover:text-white transition-colors'
                    onClick={() =>
                      copyToClipboard(SimpleAccountAddress as string)
                    }
                  />
                </div>
                <div className=''>{Number(accountBalance).toFixed(2)} ETH</div>
              </div>
            </div>
            <div className=''></div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='flex-2  flex items-center justify-center '>
        <Button
          onClick={() => {
            setOpen(false);
            setOpenMobile(false);
          }}
          variant='secondary'
          className=' rounded-full bg-muted flex items-center justify-center'
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
