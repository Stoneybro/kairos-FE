import React, { useState } from "react";
import time from "../../public/time.svg";
import coin from "../../public/coin.svg";
import Image from "next/image";
import { formatEther } from "viem";
import TaskDetailsCard from "./TaskDetails";
import { Loader2 } from "lucide-react";
type TaskCardProps = {
  id: bigint;
  description: string;
  rewardAmount: bigint;
  deadline: bigint;
  valid: boolean;
  status: number;
  choice: number;
  delayDuration: bigint;
  buddyAddress?: `0x${string}`;
  completeTask: (id: bigint) => void;
  cancelTask: (id: bigint) => void;
};

enum TaskStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  CANCELED = 2,
  EXPIRED = 3,
}

const TaskCard = ({
  id,
  description,
  rewardAmount,
  deadline,
  valid,
  status,
  choice,
  delayDuration,
  buddyAddress,
  completeTask,
  cancelTask,
}: TaskCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [completeButton, setCompleteButton] = useState<
    "Complete" | "Completing" | "Completed"
  >("Complete");
  const [cancelButton, setCancelButton] = useState<
    "Cancel" | "Canceling" | "Canceled"
  >("Cancel");
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-[#31FF7C33] text-[#31FF7C]";
      case "canceled":
        return "bg-[#FF4E4E33] text-[#FF4E4E]";
      case "expired":
        return "bg-[#FF4E4E33] text-[#FF4E4E]";
      default:
        return "bg-[#1C4ED833] text-[#1C4ED8]";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTimeRemaining = (deadline: bigint) => {
    const now = new Date().getTime();
    const deadlineTime = Number(deadline) * 1000;
    const diff = deadlineTime - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className=' flex flex-col gap-5 border-border-main p-6 rounded-2xl border-[1px] font-inter'>
      {isDetailsOpen && (
        <TaskDetailsCard
          id={id}
          description={description}
          rewardAmount={rewardAmount}
          deadline={getTimeRemaining(deadline)}
          status={status}
          choice={choice}
          delayDuration={delayDuration}
          buddy={buddyAddress}
          completeTask={completeTask}
          cancelTask={cancelTask}
          closeDetails={() => setIsDetailsOpen(false)}
        />
      )}
      {/* Header */}
      <div className='flex items-start justify-between'>
        <h3 className='text-textMain font-medium text-base leading-relaxed flex-1 mr-4'>
          {description}
        </h3>
        <span
          className={`px-2 py-1  text-xs  rounded-2xl font-medium ${getStatusColor(
            TaskStatus[status]
          )}`}
        >
          {getStatusText(TaskStatus[status])}
        </span>
      </div>
      {/* ETH Amount and Duration */}
      <div className='flex items-center gap-4'>
        <div className='flex items-center gap-2'>
          <span>
            <Image src={coin} width={20} height={20} alt='coin logo' />
          </span>
          <span className='text-textMain font-medium'>
            {formatEther(rewardAmount)} ETH
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <span>
            <Image src={time} width={20} height={20} alt='time remaining' />
          </span>

          <span className='text-textMain font-medium'>
            {getStatusText(TaskStatus[status]) === "ACTIVE"
              ? getTimeRemaining(deadline)
              : "-"}
          </span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className='flex justify-between py-2'>
        {status === 0 && (
          <div className='flex gap-4'>
            <button
              className=' rounded-lg bg-button-success text-black py-2 px-6 cursor-pointer flex items-center justify-center'
              onClick={() => {
                completeTask(id);
                setCompleteButton("Completing");
              }}
            >
              {completeButton === "Completing" && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {completeButton}
            </button>
            <button
              className=' rounded-lg bg-white text-button-expired py-2 px-6 cursor-pointer flex items-center justify-center'
              onClick={() => {
                cancelTask(BigInt(id));
                setCancelButton("Canceling");
              }}
            >
              {cancelButton === "Canceling" && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {cancelButton}
            </button>
          </div>
        )}
        <button
          onClick={() => setIsDetailsOpen(true)}
          className='  rounded-lg bg-button-secondary text-white  py-2 px-6 cursor-pointer'
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
