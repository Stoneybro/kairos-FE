"use client";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDashboard } from "@/app/hooks/useDashboard";
import { formatEther } from "viem";
import { FaCoins } from "react-icons/fa";
import { IoIosListBox } from "react-icons/io";
import { MdLock } from "react-icons/md";
import { BiBullseye } from "react-icons/bi";
import { useSidebar } from "./ui/sidebar";
export function SectionCards() {
  const { availableBalance, commitedFunds, activeTasks, completionRate } =
    useDashboard();
  const { setOpen } = useSidebar();
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4  *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs  @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Available Balance</CardDescription>
          <CardTitle className='text-2xl font-medium tabular-nums @[250px]/card:text-3xl'>
            {formatEther(availableBalance)} ETH
          </CardTitle>
          <CardAction>
            <FaCoins size={35} />
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {Number(availableBalance) == 0
              ? "Deposit funds to get started"
              : "For tasks, and transfers"}
          </div>
        </CardFooter>
      </Card>

      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Active Tasks</CardDescription>
          <CardTitle className='text-2xl font-medium tabular-nums @[250px]/card:text-3xl'>
            {activeTasks ? activeTasks?.length : "0"}
          </CardTitle>
          <CardAction>
            <IoIosListBox size={35} />
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {!activeTasks || activeTasks?.length === 0
              ? "No active tasks"
              : activeTasks.length === 1
              ? "1 active task"
              : `${activeTasks.length} tasks in progress`}
          </div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Commited Funds</CardDescription>
          <CardTitle className='text-2xl font-medium tabular-nums @[250px]/card:text-3xl'>
            {commitedFunds} ETH
          </CardTitle>
          <CardAction>
            <MdLock size={35} />
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Locked in active tasks & penalties
          </div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader>
          <CardDescription>Task Performance</CardDescription>
          <CardTitle className='text-2xl font-medium tabular-nums @[250px]/card:text-3xl'>
            {completionRate ? completionRate.toFixed(2) : 0}%
          </CardTitle>
          <CardAction>
            <BiBullseye size={35} />
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Overall success rate
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
