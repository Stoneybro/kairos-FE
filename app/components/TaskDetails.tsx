import React from "react";
import time from "../../public/time.svg";
import coin from "../../public/coin.svg";
import Image from "next/image";
import { formatEther, parseEther } from "viem";
import { X } from "lucide-react";
import { get } from "http";

type TaskDetailsProps = {
  id: bigint;
  description: string;
  rewardAmount: bigint;
  deadline: string;
  status: number;
  choice: number;
  delayDuration: bigint;
  buddy?: `0x${string}`;
  completeTask: (id: bigint) => void;
  cancelTask: (id: bigint) => void;
  closeDetails: () => void;
};
enum TaskStatus {
  ACTIVE = 0,
  COMPLETED = 1,
  CANCELED = 2,
  EXPIRED = 3,
}
enum PenaltyType {
  DELAY_PAYMENT = 1,
  SEND_BUDDY = 2,
}
const TaskDetailsCard = ({
  id,
  description,
  rewardAmount,
  deadline,
  status,
  choice,
  delayDuration,
  buddy,
  completeTask,
  cancelTask,
  closeDetails,
}: TaskDetailsProps) => {
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

  return (
    <div className='top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  text-white rounded-lg bg-secondary w-[35vw] fixed'>
      <div className='flex flex-col p-4 gap-2'>
        {/* Header */}
        <div className='flex justify-between'>
          <div className='text-white font-medium text-base'>Task Details</div>
          <button
            onClick={closeDetails}
            className='text-gray-400 hover:text-white text-xl leading-none cursor-pointer'
          >
            <X className='h-6 w-6' />
          </button>
        </div>

        {/* Content */}
        <div className=' flex flex-col gap-4'>
          {/* Task Title and Status */}
          <div className=''>
            <div className='text-white mb-2 font-medium text-base leading-relaxed'>
              {description}
            </div>
            <span
              className={`px-2 py-1  text-xs rounded-2xl font-medium ${getStatusColor(
                TaskStatus[status]
              )}`}
            >
              {getStatusText(TaskStatus[status])}
            </span>
          </div>

          {/* Details Grid */}
          <div className='flex justify-between gap-4'>
            <div className='bg-[#17A34A0A] rounded-2xl p-6 border w-full border-[#17A34A29]'>
              <div className='flex items-center gap-2'>
                <div className=' text-sm text-white '>Reward Amount</div>
              </div>
              <div className='text-lg font-bold text-button-success'>
                {formatEther(rewardAmount)} ETH
              </div>
            </div>
            <div className='bg-[#2463EB0A] rounded-2xl p-6 border w-full border-[#2463EB29]'>
              <div className='flex flex-col items-center'>
                <div className='text-white text-sm '>Deadline</div>
                <div className=' text-text-tag-pending text-sm flex gap-1'>
                  {getStatusText(TaskStatus[status])==="ACTIVE"?deadline:"-"}
                </div>
              </div>
            </div>
          </div>

          {/* Penalty */}
          <div className='flex  items-start px-2 bg-[#DB242405] border-tag-expired  border-[1px] rounded-lg py-1 gap-1 my-4'>
            <span className='text-text-tag-expired text-xs'>Penalty:</span>
            <span className=' text-xs flex  text-right '>
              {choice === PenaltyType.DELAY_PAYMENT
                ? `Delay payment by ${Number(delayDuration) / 86400} days`
                : `send to ${buddy} `}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {getStatusText(TaskStatus[status])==="ACTIVE" && <div className='flex gap-3 pt-2'>
          <button
            onClick={() => completeTask(id)}
            className='flex-1 rounded-lg bg-button-success text-black py-2 px-4 font-medium hover:opacity-90 transition-opacity cursor-pointer'
          >
            Complete Task
          </button>
          <button
            onClick={() => cancelTask(id)}
            className='flex-1 rounded-lg bg-white text-button-expired py-2 px-4 font-medium hover:opacity-90 transition-opacity cursor-pointer'
          >
            Cancel Task
          </button>
        </div>}
      </div>
    </div>
  );
};

export default TaskDetailsCard;
