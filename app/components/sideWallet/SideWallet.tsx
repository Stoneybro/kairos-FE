"use client";
import { useState } from "react";
import {
  X,
  Copy,
  ChevronDown,
  Clock,
  Settings2,
  LucideHome,
  ArrowLeft,
} from "lucide-react";
import { formatEther, formatUnits } from "viem";
import { useUiStore } from "../../lib/store/UIStore";
import { useAddressStore } from "../../lib/store/addressStore";
import { useAccount, useBalance } from "wagmi";
import Home from "./Home";
import Settings from "./settings";
import Activity from "./Activity";
import Receive from "./Receive";
import Deposit from "./Deposit";
import Send from "./Send";

/*//////////////////////////////////////////////////////////////
                                 TYPES
//////////////////////////////////////////////////////////////*/
type propType = {
  fund: bigint | string;
  balance: bigint | string;
};
type activeTabType =
  | "home"
  | "activity"
  | "settings"
  | "receive"
  | "deposit"
  | "send";

export default function SideWallet({ fund, balance }: propType) {
  /*//////////////////////////////////////////////////////////////
                                STATES
//////////////////////////////////////////////////////////////*/
  const [activeTab, setActiveTab] = useState<activeTabType>("home");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  /*//////////////////////////////////////////////////////////////
                                HOOKS
//////////////////////////////////////////////////////////////*/
  const { address } = useAccount();
  const { data, isLoading, isError } = useBalance({
    address,
  });
  /*//////////////////////////////////////////////////////////////
                                CUSTOM HOOKS
//////////////////////////////////////////////////////////////*/
  const closeSideBar = useUiStore((state) => state.closeSideWallet);
  const SimpleAccountAddress = useAddressStore(
    (state) => state.SmartAccountAddress
  );
  const availableBalance = Number(balance) - Number(fund);


  /*//////////////////////////////////////////////////////////////
                                FUNCTIONS
//////////////////////////////////////////////////////////////*/
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
  const formattedBalance = formatUnits(
    data ? data.value : 0n,
    data ? data.decimals : 0
  );
  console.log("address:",SimpleAccountAddress,"balance:",balance);
  
  /*//////////////////////////////////////////////////////////////
                                JSX
//////////////////////////////////////////////////////////////*/
  return (
    <div className='fixed right-0 top-0 h-full w-80 bg-secondary text-white flex flex-col  z-50'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 relative flex-[10%] '>
        <button onClick={()=>setActiveTab("home")} className="w-6 h-6">
          {(activeTab==="receive" || activeTab==="deposit" || activeTab==="send") && <ArrowLeft className="w-6 h-6 text-gray-400" />}
        </button>
        <div className='flex  items-center gap-2 bg-main rounded-full px-3 py-2'>
          <span className='text-gray-300 text-sm font-mono'>
            {truncateAddress(SimpleAccountAddress as string)}
          </span>
          <Copy
            className='w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors'
            onClick={() => copyToClipboard(SimpleAccountAddress as string)}
          />
          <ChevronDown
            onClick={() => setShowAddressDropdown(!showAddressDropdown)}
            className='w-4 h-4 text-gray-400 cursor-pointer'
          />
        </div>
        <X
          className='w-6 h-6   text-gray-400 cursor-pointer hover:text-white transition-colors'
          onClick={closeSideBar}
        />
        {/*DropDown*/}
        {showAddressDropdown && (
          <div className=' p-4 bg-main border-button-secondary border-2 absolute top-15 flex flex-col gap-3 w-[80%] rounded-2xl text-sm '>
            <div className='flex flex-col gap-1'>
              <div className=''>Personal Wallet</div>
              <div className='flex justify-between'>
                <div className='flex gap-2 text-gray-400'>
                 {truncateAddress(address as `0x${string}`)}  
                  <Copy
                    className='w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors'
                      onClick={() => copyToClipboard(address as string)}
                    
                  />
                </div>
                <div className=''>
                  {Number(formattedBalance).toFixed(2)} ETH
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <div className=''>Smart Wallet</div>
              <div className='flex justify-between'>
                <div className='flex gap-1 text-gray-400'>
                  {truncateAddress(SimpleAccountAddress as string)}
                  <Copy
                    className='w-4 h-4 text-gray-400 cursor-pointer hover:text-white transition-colors'
                  onClick={() =>
                      copyToClipboard(SimpleAccountAddress as string)}
                  />
                </div>
                <div className=''>{Number(balance).toFixed(2)} ETH</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content*/}
      <div className=' flex-[80%] flex justify-center items-center'>
        {activeTab === "home" && <Home fund={fund} balance={balance} setTab={setActiveTab} />}
        {activeTab === "activity" && <Activity />}
        {activeTab === "settings" && <Settings />}
        {activeTab === "receive" && <Receive address={SimpleAccountAddress} />}
        {activeTab === "deposit" && <Deposit balance={formattedBalance} />}
        {activeTab === "send" && <Send balance={String(availableBalance)} />}
      </div>

      {/* Bottom Navigation */}
      <div className=' flex-[10%] flex justify-center items-start'>
        <div className=' flex gap-6 bg-main rounded-full py-3 px-7'>
          <button onClick={() => setActiveTab("home")}>
            <LucideHome className='w-7 h-7 cursor-pointer' />
          </button>
          <button onClick={() => setActiveTab("activity")}>
            <Clock className='w-7 h-7 cursor-pointer' />
          </button>
          <button onClick={() => setActiveTab("settings")}>
            <Settings2 className='w-7 h-7 cursor-pointer' />
          </button>
        </div>
      </div>
    </div>
  );
}
