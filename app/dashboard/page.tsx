"use client";
import { useRouter } from "next/navigation";
import SideWallet from "../components/sideWallet/SideWallet";
import TaskCard from "../components/TaskCard";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import coin from "../../public/coin.svg";
import target from "../../public/target.svg";
import lock from "../../public/lock.svg"
import { formatEther} from "viem";
import { useDashboard } from "../hooks/useDashboard";
import { PenaltyType } from "../types/types";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { WalletSidebar } from "@/components/wallet-sidebar"
import TaskCreation from "@/components/section-createtasks";
import { useAddressStore } from "../lib/store/addressStore";
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import TasksList from "@/components/section-Tasktable";
import { usePrivy } from "@privy-io/react-auth";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"


/*//////////////////////////////////////////////////////////////
                                TYPES
//////////////////////////////////////////////////////////////*/

export default function Dashboard() {
  /*//////////////////////////////////////////////////////////////
                                STATES
//////////////////////////////////////////////////////////////*/

  //UI

  /*//////////////////////////////////////////////////////////////
                           HOOKS
//////////////////////////////////////////////////////////////*/
  const router = useRouter();
  const smartAccountAddress = useAddressStore(
    (state) => state.SmartAccountAddress
  );
  /*//////////////////////////////////////////////////////////////
                            CUSTOM HOOKS
//////////////////////////////////////////////////////////////*/
const {
  showCreateTask,
  setShowCreateTask,
  activeTab,
  setActiveTab,
  createTaskButton,
  setCreateTaskButton,
  taskDescription,
  setTaskDescription,
  rewardAmount,
  setRewardAmount,
  deadline,
  setDeadline,
  delayDuration,
  setDelayDuration,
  buddyAddress,
  setBuddyAddress,
  penaltyType,
  setPenaltyType,
  taskFormError,
  setTaskFormError,
  accountBalance,
  commitedFunds,
  availableBalance,
  activeTasks,
  filteredTasks,
  completeTask,
  cancelTask,
  isSideBarOpen,
  isDisabled,
  createTask
}=useDashboard();

const {authenticated}=usePrivy()

  /*//////////////////////////////////////////////////////////////
                             FUNCTIONS
//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////
                              USEEFFECTS
  //////////////////////////////////////////////////////////////*/
  useEffect(()=>{
    if (!authenticated && !smartAccountAddress ) {
      router.push("/");
    }
  },[authenticated])

  /*//////////////////////////////////////////////////////////////
                              JSX
  //////////////////////////////////////////////////////////////*/

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 95)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col  ">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-6 lg:px-8   py-4 md:gap-6 md:py-6">
              <SectionCards />
              <TasksList />
            </div>
          </div>
        </div>
      </SidebarInset>
            <WalletSidebar variant="inset" side="right" />
    </SidebarProvider>
  );
}
