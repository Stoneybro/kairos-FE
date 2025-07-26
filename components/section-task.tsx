"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatEther, parseEther } from "viem";
// import TaskDetailsCard from "./TaskDetails";
import { Loader2 } from "lucide-react";
import { HiOutlineClock } from "react-icons/hi2";
import { Badge } from "./ui/badge";
import { useDashboard } from "@/app/hooks/useDashboard";
import { toast } from "sonner";

type TaskCardProps = {
  id: bigint;
  description: string;
  rewardAmount: bigint;
  deadline: bigint;
  valid: boolean;
  status: number;
  choice: number;
  delayDuration: bigint;
  buddy?: `0x${string}`;
  delayedRewardReleased: boolean;
  completeTask: (id: bigint) => void;
  cancelTask: (id: bigint) => void;
  releasePayment: (id: bigint) => void;
  // Add these new props for tracking operation states
  isCompleting?: boolean;
  isCanceling?: boolean;
  isReleasing?: boolean;
};

enum TaskStatus {
  Active = 0,
  Completed = 1,
  Canceled = 2,
  Expired = 3,
}
enum PenaltyType {
  DELAY_PAYMENT = 1,
  SEND_BUDDY = 2,
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
  buddy,
  delayedRewardReleased,
  completeTask,
  cancelTask,
  releasePayment,
  isCompleting = false,
  isCanceling = false,
  isReleasing = false,
}: TaskCardProps) => {
  const getCompleteButtonState = () => {
    if (isCompleting) return "Completing";
    if (status === TaskStatus.Completed) return "Completed";
    return "Complete";
  };

  const getCancelButtonState = () => {
    if (isCanceling) return "Canceling";
    if (status === TaskStatus.Canceled) return "Canceled";
    return "Cancel";
  };
  const getIsReleasingButtonState = () => {
    if (isReleasing) return "Releasing";
    if (delayedRewardReleased) return "Released";
    return "Release";
  };

  const isDelayPeriodElapsed = () => {
    const now = Date.now();
    const deadlineInSeconds =
      typeof deadline === "bigint" ? Number(deadline) : deadline;
    const delayDurationInSeconds = Number(delayDuration);
    const penaltyExpiryTime =
      (deadlineInSeconds + delayDurationInSeconds) * 1000;
    return now >= penaltyExpiryTime;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500 text-white dark:bg-green-600";
      case "canceled":
        return "bg-destructive text-white";
      case "expired":
        return " bg-destructive text-white";
      default:
        return "bg-blue-500 text-white dark:bg-blue-600";
    }
  };

  const getStatusText = (status: string) => {
    //console.log();
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTimeRemaining = (deadline: bigint | number) => {
    const now = Date.now(); // milliseconds

    // Convert deadline to number (should be Unix timestamp in seconds)
    const deadlineInSeconds =
      typeof deadline === "bigint" ? Number(deadline) : deadline;

    // Convert to milliseconds for comparison with Date.now()
    const deadlineMs = deadlineInSeconds * 1000;
    const diff = deadlineMs - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const dayText = days === 1 ? "day" : "days";
    const hourText = hours === 1 ? "hour" : "hours";
    const minuteText = minutes === 1 ? "minute" : "minutes";

    if (days > 0) return `${days} ${dayText} ${hours} ${hourText} left`;
    if (hours > 0) return `${hours} ${hourText} ${minutes} ${minuteText} left`;
    return `${minutes}m`;
  };

  // New function to calculate delay penalty remaining time
  const getDelayPenaltyTimeRemaining = (
    deadline: bigint | number,
    delayDuration: bigint
  ) => {
    const now = Date.now();
    const deadlineInSeconds =
      typeof deadline === "bigint" ? Number(deadline) : deadline;
    const delayDurationInSeconds = Number(delayDuration);

    // Calculate when the delay penalty expires (original deadline + delay duration)
    const penaltyExpiryTime =
      (deadlineInSeconds + delayDurationInSeconds) * 1000;
    const diff = penaltyExpiryTime - now;

    if (diff <= 0) return "Delay penalty completed";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const dayText = days === 1 ? "day" : "days";
    const hourText = hours === 1 ? "hour" : "hours";
    const minuteText = minutes === 1 ? "minute" : "minutes";

    if (days > 0) return `${days} ${dayText} ${hours} ${hourText} left`;
    if (hours > 0) return `${hours} ${hourText} ${minutes} ${minuteText} left`;
    return `${minutes} ${minuteText} left`;
  };

  const getFormattedDate = (deadline: bigint | number) => {
    const deadlineInSeconds =
      typeof deadline === "bigint" ? Number(deadline) : deadline;

    const deadlineDate = new Date(deadlineInSeconds * 1000);

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    return deadlineDate.toLocaleDateString("en-US", options);
  };

  const handleCompleteTask = () => {
    completeTask(id);
  };

  const handleCancelTask = () => {
    cancelTask(id);
  };
  const handleReleasePayment = () => {
    releasePayment(id);
  };

const renderPenaltyInfo = () => {
  if (choice === PenaltyType.DELAY_PAYMENT) {
    // Convert seconds back to hours first
    const delayHours = Number(delayDuration) / 3600;
    
    // Calculate days and remaining hours
    const days = Math.floor(delayHours / 24);
    const hours = delayHours % 24;
    
    // Format the display text
    let delayText = "";
    if (days > 0 && hours > 0) {
      delayText = `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (days > 0) {
      delayText = `${days} day${days > 1 ? 's' : ''}`;
    } else {
      delayText = `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    
    return (
      <div className='flex flex-col gap-1'>
        <span>Delay payment by {delayText}</span>
      </div>
    );
  } else if (choice === PenaltyType.SEND_BUDDY) {
    if (buddy && buddy !== "0x0000000000000000000000000000000000000000") {
      return `Sen${status == TaskStatus.Expired ? "t" : "d"} to ${buddy}`;
    } else {
      return "Send to buddy (address not set)";
    }
  }
  return "No penalty set";
};

  const completeButtonText = getCompleteButtonState();
  const cancelButtonText = getCancelButtonState();
  const releasePaymentText = getIsReleasingButtonState();
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <div className=' flex flex-col gap-2 px-4 border-accent-foreground/20 bg-background p-2 rounded-2xl border-[1px] font-inter'>
            {/* Header */}
            <div className='flex gap-2'>
              <div className=' '>{description}</div>
              <div className=''>
                <Badge variant='secondary'>
                  {formatEther(rewardAmount)} ETH
                </Badge>
              </div>
              <Badge className={` ${getStatusColor(TaskStatus[status])}`}>
                {getStatusText(TaskStatus[status])}
              </Badge>
            </div>
            {/* ETH Amount and Duration */}
            <div className=''>
              <div className='flex items-center gap-1 text-sm text-muted-foreground '>
                <HiOutlineClock />
                {getStatusText(TaskStatus[status]) === "Active"
                  ? getTimeRemaining(deadline)
                  : "-"}
              </div>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
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
                  <div className='text-white text-sm '>
                    {getStatusText(TaskStatus[status]) === "Expired" &&
                    choice === PenaltyType.DELAY_PAYMENT
                      ? `Delay`
                      : `Deadline`}
                  </div>
                  <div className=' text-text-tag-pending text-sm flex flex-col gap-1 text-center'>
                    {getStatusText(TaskStatus[status]) === "Active" ? (
                      <>
                        <div>{getTimeRemaining(deadline)}</div>
                        <div className='text-xs text-muted-foreground'>
                          {getFormattedDate(deadline)}
                        </div>
                      </>
                    ) : getStatusText(TaskStatus[status]) === "Expired" &&
                      choice === PenaltyType.DELAY_PAYMENT ? (
                      <>
                        <div className='text-xs '>
                          {getDelayPenaltyTimeRemaining(
                            deadline,
                            delayDuration
                          )}
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Penalty */}
           { <div className='flex items-center justify-start px-2 bg-[#DB242405] border-tag-expired border-[1px] rounded-lg py-1 gap-1 my-4'>
              <span className='text-text-tag-expired text-xs'>Penalty:</span>
              <span className='text-[11px] flex text-right'>
                {renderPenaltyInfo()}
              </span>
            </div>}
          </div>

          <DialogFooter>
            {getStatusText(TaskStatus[status]) === "Active" && (
              <div className='flex gap-3 pt-2'>
                <Button
                  onClick={handleCompleteTask}
                  variant={"default"}
                  disabled={isCompleting || isCanceling}
                >
                  {isCompleting && <Loader2 className=' animate-spin' />}
                  {completeButtonText} Task
                </Button>
                <Button
                  onClick={handleCancelTask}
                  variant={"destructive"}
                  disabled={isCompleting || isCanceling}
                >
                  {isCanceling && <Loader2 className=' animate-spin' />}
                  {cancelButtonText} Task
                </Button>
              </div>
            )}
            {getStatusText(TaskStatus[status]) === "Expired" &&
              choice === PenaltyType.DELAY_PAYMENT && (
                <Button
                  onClick={handleReleasePayment}
                  variant={"secondary"}
                  disabled={isReleasing || !isDelayPeriodElapsed()}
                >
                  {isReleasing && <Loader2 className=' animate-spin' />}
                  {getIsReleasingButtonState()}
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default TaskCard;
