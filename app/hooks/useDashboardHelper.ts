"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PenaltyType } from "../types/types";
import { TaskType } from "../types/types";
import { TaskStatus } from "../types/types";
import { formatEther, parseEther } from "viem";
import { log } from "util";
/*************************************************************************/
/** 🧩 TYPES *************************************************************/
/*************************************************************************/
export type dashboardHelper = {
  _accountBalance: bigint | undefined;
  _taskCount: bigint | undefined;
  _commitedFunds: bigint | undefined;
  activeTab: "active" | "completed" | "expired" | "canceled";
  createTaskButton: "Create Task" | "Creating Task" | "Task Created";
  tasks: readonly TaskType[] | undefined;
  taskDescription: string;
  rewardAmount: string;
  deadline: Date | undefined;
  delayDuration: string;
  buddyAddress: string;
  penaltyType: PenaltyType;
};
export function useDashboardHelper({
  _accountBalance,
  rewardAmount,
  _taskCount,
  _commitedFunds,
  activeTab,
  createTaskButton,
  deadline,
  tasks,
  taskDescription,
  delayDuration,
  buddyAddress,
  penaltyType,
}: dashboardHelper) {
  /*************************************************************************/
  /** 🧠 STATES ***********************************************************/
  /*************************************************************************/

  /*************************************************************************/
  /** 🪝 WAGMI / OTHER HOOKS **********************************************/
  /*************************************************************************/

  /*************************************************************************/
  /** 🛠 CUSTOM HOOKS *****************************************************/
  /*************************************************************************/

  /*************************************************************************/
  /** 🚀 ACTION METHODS ***************************************************/
  /*************************************************************************/
  const accountBalance =
    _accountBalance === undefined
      ? "unavailable"
      : `${formatEther(_accountBalance as bigint)}`;

  const taskCount =
    _taskCount === undefined ? "unavailable" : Number(_taskCount);

  const commitedFunds =
    _commitedFunds === undefined
      ? "0"
      : `${formatEther(_commitedFunds as bigint)}`;

  const availableBalance =
    typeof _accountBalance === "bigint" && typeof _commitedFunds === "bigint"
      ? _accountBalance - _commitedFunds
      : 0n;

const deadlineInSeconds = deadline ? Math.floor(deadline.getTime() / 1000) : undefined

  const statusMap = {
    active: TaskStatus.ACTIVE,
    completed: TaskStatus.COMPLETED,
    expired: TaskStatus.EXPIRED,
    canceled: TaskStatus.CANCELED,
  };
  const filteredTasks = tasks?.filter(
    (task) => task.status === statusMap[activeTab]
  );
  const activeTasks = tasks?.filter((task) => task.status === 0);
  const completedTasks = tasks?.filter((task) => task.status === 1);
  const canceledTasks = tasks?.filter((task) => task.status === 2);
  const expiredTasks = tasks?.filter((task) => task.status === 3);

  const completionRate =
    tasks && tasks.length > 0 && completedTasks
      ? (completedTasks.length / tasks.length) * 100
      : 0;
const isDisabled =
  taskDescription.trim().length < 5 ||
  !/^\d*\.?\d{0,18}$/.test(rewardAmount) ||
  parseFloat(rewardAmount) <= 0 ||
  !deadline ||
  new Date(deadline).getTime() <= Date.now() ||
  penaltyType === PenaltyType.UNDEFINED ||
  (penaltyType === PenaltyType.DELAY_PAYMENT &&
    (!/^\d+$/.test(delayDuration) ||
      parseInt(delayDuration) <= 0 ||
      parseInt(delayDuration) > 30)) ||
  (penaltyType === PenaltyType.SEND_BUDDY &&
    !/^0x[a-fA-F0-9]{40}$/.test(buddyAddress)) ||
  createTaskButton == "Creating Task" ||
  createTaskButton == "Task Created";

  function truncateAddress(address: string, start = 6, end = 4) {
    if (!address) return "";
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  }
  // const formattedBalance = formatUnits(
  //   data ? data.value : 0n,
  //   data ? data.decimals : 0
  // );
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  const validateTaskForm = () => {
    if (!taskDescription.trim()) {
      return "Please enter a task description";
    }

    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      return "Please enter a valid reward amount";
    }

    if (!deadline) {
      return "Please select a deadline";
    }

    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      return "Deadline must be in the future";
    }

    if (penaltyType === PenaltyType.SEND_BUDDY && !buddyAddress.trim()) {
      return "Please enter a buddy address";
    }

    if (
      penaltyType === PenaltyType.DELAY_PAYMENT &&
      (!delayDuration || parseInt(delayDuration) <= 0)
    ) {
      return "Please enter a valid delay duration";
    }

    // Check if user has enough balance
    if (_accountBalance !== undefined) {
      try {
        const rewardWei = parseEther(rewardAmount || "0");
        if (rewardWei > _accountBalance) {
          return "Insufficient balance to create this task";
        }
      } catch (e) {
        // The regex in isDisabled already covers invalid number formats
      }
    }
    return true;
  };
  /*************************************************************************/
  /** 📡 SIDE EFFECTS *****************************************************/
  /*************************************************************************/

  /*************************************************************************/
  /** 🎯 RETURN API *******************************************************/
  /*************************************************************************/
  return {
    accountBalance,
    taskCount,
    commitedFunds,
    availableBalance,
    filteredTasks,
    deadline,
    deadlineInSeconds,
    isDisabled,
    validateTaskForm,
    completionRate,
    copyToClipboard,
    truncateAddress,
    activeTasks,
    completedTasks,
    canceledTasks,
    expiredTasks,
  };
}
