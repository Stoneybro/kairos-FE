"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAddressStore } from "../lib/store/addressStore";
import { useUiStore } from "../lib/store/UIStore";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useReadContract,
  useTransactionReceipt,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { SMART_ACCOUNT_ABI } from "../lib/contracts";
import { formatUnits, parseEther } from "viem";

import { toast } from "sonner";
import { useDataStore } from "../lib/store/dataStore";
import { useDashboardHelper } from "./useDashboardHelper";
import { TaskType } from "../types/types";
import { PenaltyType } from "../types/types";

/*************************************************************************/
/** 🧩 TYPES *************************************************************/
/*************************************************************************/

export function useDashboard() {
  /*************************************************************************/
  /** 🧠 STATES ***********************************************************/
  /*************************************************************************/
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "active" | "completed" | "expired" | "canceled"
  >("active");
  const [createTaskButton, setCreateTaskButton] = useState<
    "Create Task" | "Creating Task" | "Task Created"
  >("Create Task");
  //TASK FORM
  const [taskDescription, setTaskDescription] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [delayDuration, setDelayDuration] = useState("");
  const [buddyAddress, setBuddyAddress] = useState("");
  const [penaltyType, setPenaltyType] = useState(PenaltyType.UNDEFINED);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState(false);

  // Add states for tracking which tasks are being operated on
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(
    new Set()
  );
  const [cancelingTasks, setCancelingTasks] = useState<Set<string>>(new Set());
  const [releasingPayment, setReleasingPayment] = useState<Set<string>>(
    new Set()
  );

  /*************************************************************************/
  /** 🛠 CUSTOM HOOKS *****************************************************/
  /*************************************************************************/
  const smartAccountAddress = useAddressStore(
    (state) => state.SmartAccountAddress
  );
  const TaskManagerAddress = useAddressStore(
    (state) => state.TaskManagerAddress
  );

  const setaccountBalanceRefetch = useDataStore(
    (state) => state.setRefetchAccountbalance
  );
  const setCommitedFundsRefetch = useDataStore(
    (state) => state.setRefetchCommittedFunds
  );
  const isSideBarOpen = useUiStore((state) => state.isSideWalletOpen);
  /*************************************************************************/
  /** 🪝 WAGMI / OTHER HOOKS **********************************************/
  /*************************************************************************/
  const { data: createTaskHash, writeContract: useWriteCreateTask } =
    useWriteContract();
  const { isSuccess: isCreateTaskSuccess } = useTransactionReceipt({
    hash: createTaskHash,
  });
  const { data: completeTaskHash, writeContract: useWriteCompleteTask } =
    useWriteContract();
  const { isSuccess: isCompleteTaskSuccess, isError: isCompleteTaskError } =
    useTransactionReceipt({
      hash: completeTaskHash,
    });
  const { data: cancelTaskHash, writeContract: useWriteCancelTask } =
    useWriteContract();
  const { data: releasePaymentHash, writeContract: useWritereleasePayment } =
    useWriteContract();
  const { isSuccess: isReleasePaymentSuccess, isError: isReleasePaymentError } =
    useTransactionReceipt({ hash: releasePaymentHash });
  const { isSuccess: isCancelTaskSuccess, isError: isCancelTaskError } =
    useTransactionReceipt({
      hash: cancelTaskHash,
    });
  useWatchContractEvent({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    eventName: "TaskExpired",
    onLogs: (logs) => {
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      toast.success("Task Expired!");
    },
  });

  // Watch TaskCreated
  useWatchContractEvent({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    eventName: "TaskCreated",
    onLogs: (logs) => {
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      toast.success("Task Created");
    },
  });

  // Watch TaskCompleted
  useWatchContractEvent({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    eventName: "TaskCompleted",
    onLogs: (logs) => {
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      setCompletingTasks(new Set());
      toast.success("Task completed successfully!");
    },
  });

  // Watch TaskCanceled
  useWatchContractEvent({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    eventName: "TaskCanceled",
    onLogs: (logs) => {
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
            setCancelingTasks(new Set());
      toast.info("Task canceled successfully!");

    },
  });

  useWatchContractEvent({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    eventName: "DelayedPaymentReleased",
    onLogs: (logs) => {
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      setReleasingPayment(new Set());
      toast.info("Payment Released Successfully");
    },
  });

  const { address } = useAccount();
  const {
    data: pWalletBalance,
    isLoading,
    isError,
  } = useBalance({
    address,
  });
  const formattedPersonalBalance = formatUnits(
    pWalletBalance ? pWalletBalance.value : 0n,
    pWalletBalance ? pWalletBalance.decimals : 0
  );
  const { data: _accountBalance, refetch: balanceRefetch } = useBalance({
    address: smartAccountAddress as `0x${string}`,
    query: {
      enabled: !!smartAccountAddress,
    },
  });

  const { data: _taskCount } = useReadContract({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    functionName: "getTotalTasks",
    query: {
      enabled: !!smartAccountAddress,
    },
  });

  const { data: _commitedFunds, refetch: commitedFundsrefetch } =
    useReadContract({
      address: smartAccountAddress as `0x${string}`,
      abi: SMART_ACCOUNT_ABI,
      functionName: "s_totalCommittedReward",
      query: {
        enabled: !!smartAccountAddress,
      },
    });

  const { data: tasks, refetch: taskRefetch } = useReadContract({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    functionName: "getAllTasks",
    query: {
      enabled: !!smartAccountAddress,
    },
  });

  /*************************************************************************/
  /** 📡 HELPERS *****************************************************/
  /*************************************************************************/
  // If tasks is [count, taskArray]

  const {
    accountBalance,
    taskCount,
    commitedFunds,
    availableBalance,
    deadlineInSeconds,
    filteredTasks,
    isDisabled,
    validateTaskForm,
    completionRate,
    copyToClipboard,
    truncateAddress,
    activeTasks,
    completedTasks,
    canceledTasks,
    expiredTasks,
  } = useDashboardHelper({
    _accountBalance: _accountBalance?.value,
    rewardAmount: rewardAmount,
    _taskCount: _taskCount,
    _commitedFunds: _commitedFunds,
    activeTab: activeTab,
    createTaskButton: createTaskButton,
    deadline: deadline,
    tasks: tasks,
    taskDescription: taskDescription,
    delayDuration: delayDuration,
    buddyAddress: buddyAddress,
    penaltyType: penaltyType,
  });

  /*************************************************************************/
  /** 🚀 ACTION METHODS ***************************************************/
  /*************************************************************************/
  //fix the addressstore problem
  // In useDashboard.js, fix the createTask function:

  async function createTask() {
    const formValidity = validateTaskForm();
    if (formValidity !== true) {
      // Use the specific error message from the validation function
      toast.error(formValidity);
      return;
    }
    setCreateTaskButton("Creating Task");

    // Calculate deadline duration in seconds from now
    const deadlineInSeconds = deadline
      ? BigInt(
          Math.floor(deadline.getTime() / 1000) - Math.floor(Date.now() / 1000)
        )
      : BigInt(0);

    try {
      await useWriteCreateTask({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "createTask",
        args: [
          taskDescription,
          parseEther(rewardAmount),
          deadlineInSeconds, // This should be duration, not absolute timestamp
          penaltyType === PenaltyType.DELAY_PAYMENT ? 1 : 2,
          penaltyType === PenaltyType.SEND_BUDDY
            ? (buddyAddress as `0x${string}`)
            : "0x0000000000000000000000000000000000000000",
          penaltyType === PenaltyType.DELAY_PAYMENT
            ? BigInt(parseInt(delayDuration) * 86400)
            : BigInt(0),
        ],
      });
    } catch (error) {
      console.log(error);
      setCreateTaskButton("Create Task");
    }
  }

  async function completeTask(id: bigint) {
    if (taskCount == 0) {
      console.log("no tasks available");
      return;
    }

    const taskId = id.toString();

    // Add task to completing set
    setCompletingTasks((prev) => new Set([...prev, taskId]));

    try {
      await useWriteCompleteTask({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "completeTask",
        args: [id],
      });
    } catch (error) {
      console.log(error);
      // Remove from completing set on error
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }

  async function cancelTask(id: bigint) {
    if (taskCount == 0) {
      console.log("no tasks available");
      return;
    }

    const taskId = id.toString();

    // Add task to canceling set
    setCancelingTasks((prev) => new Set([...prev, taskId]));

    try {
      await useWriteCancelTask({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "cancelTask",
        args: [id],
      });
    } catch (error) {
      console.log(error);
      // Remove from canceling set on error
      setCancelingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  }
  async function releasePayment(id: bigint) {
    if (taskCount == 0) {
      console.log("no tasks available");
      return;
    }
    setReleasingPayment((prev) => new Set([...prev, id.toString()]));
    try {
      await useWritereleasePayment({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "releaseDelayedPayment",
        args: [id],
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to release payment. Please try again.");
    }
  }
  // Helper functions to check if a specific task is being operated on
  const isTaskCompleting = (taskId: bigint) => {
    return completingTasks.has(taskId.toString());
  };

  const isTaskCanceling = (taskId: bigint) => {
    return cancelingTasks.has(taskId.toString());
  };
  const releasePaymentInProgress = (taskId: bigint) => {
    return releasingPayment.has(taskId.toString());
  };

  /*************************************************************************/
  /** 📡 SIDE EFFECTS *****************************************************/
  /*************************************************************************/

  useEffect(() => {
    if (createTaskButton === "Task Created") {
      setCreateTaskButton("Create Task");
      setLocalSuccess(false);
    }
  }, [taskDescription, rewardAmount, deadline, delayDuration, buddyAddress]);


  useEffect(() => {
    setaccountBalanceRefetch(balanceRefetch);
    setCommitedFundsRefetch(commitedFundsrefetch);
  }, [
    balanceRefetch,
    commitedFundsrefetch,
    setaccountBalanceRefetch,
    setCommitedFundsRefetch,
  ]);

  /*************************************************************************/
  /** 🎯 RETURN API *******************************************************/
  /*************************************************************************/
  console.log(accountBalance, pWalletBalance);
  return {
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
    deadlineInSeconds,
    delayDuration,
    setDelayDuration,
    buddyAddress: buddyAddress as `0x${string}` | undefined,
    setBuddyAddress,
    penaltyType,
    setPenaltyType,
    taskFormError,
    setTaskFormError,
    accountBalance,
    pWalletBalance,
    taskCount,
    commitedFunds,
    availableBalance,
    completionRate,
    filteredTasks: filteredTasks as TaskType[],
    activeTasks: activeTasks as TaskType[],
    completedTasks: completedTasks as TaskType[],
    canceledTasks: canceledTasks as TaskType[],
    expiredTasks: expiredTasks as TaskType[],
    isDisabled: isDisabled as boolean | undefined,
    createTask,
    completeTask,
    cancelTask,
    releasePayment,
    TaskManagerAddress,
    smartAccountAddress,
    isSideBarOpen,
    copyToClipboard,
    truncateAddress,
    formattedPersonalBalance,
    localSuccess,
    isCompleteTaskSuccess,
    isCancelTaskSuccess,
    isTaskCompleting,
    isTaskCanceling,
    releasePaymentInProgress,
    completingTasks,
    cancelingTasks,
  };
}
