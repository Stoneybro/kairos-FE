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
  
  // TASK FORM
  const [taskDescription, setTaskDescription] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [delayDuration, setDelayDuration] = useState("");
  const [buddyAddress, setBuddyAddress] = useState("");
  const [penaltyType, setPenaltyType] = useState(PenaltyType.UNDEFINED);
  const [taskFormError, setTaskFormError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState(false);
  
  // TIMEOUT MANAGEMENT
  const [createTaskTimeoutId, setCreateTaskTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [completeTaskTimeouts, setCompleteTaskTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [cancelTaskTimeouts, setCancelTaskTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());
  const [releasePaymentTimeouts, setReleasePaymentTimeouts] = useState<Map<string, NodeJS.Timeout>>(new Map());
  
  // LOADING STATES
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const [cancelingTasks, setCancelingTasks] = useState<Set<string>>(new Set());
  const [releasingPayment, setReleasingPayment] = useState<Set<string>>(new Set());

  /*************************************************************************/
  /** 🛠 CUSTOM HOOKS *****************************************************/
  /*************************************************************************/
  const smartAccountAddress = useAddressStore((state) => state.SmartAccountAddress);
  const TaskManagerAddress = useAddressStore((state) => state.TaskManagerAddress);
  const setaccountBalanceRefetch = useDataStore((state) => state.setRefetchAccountbalance);
  const setCommitedFundsRefetch = useDataStore((state) => state.setRefetchCommittedFunds);
  const isSideBarOpen = useUiStore((state) => state.isSideWalletOpen);

  /*************************************************************************/
  /** 🪝 WAGMI / OTHER HOOKS **********************************************/
  /*************************************************************************/
  const { address } = useAccount();
  
  // Personal wallet balance
  const { data: pWalletBalance, isLoading, isError } = useBalance({ address });
  const formattedPersonalBalance = formatUnits(
    pWalletBalance ? pWalletBalance.value : 0n,
    pWalletBalance ? pWalletBalance.decimals : 0
  );

  // Smart account balance - only fetch if address exists
  const { 
    data: _accountBalance, 
    refetch: balanceRefetch,
    isError: isBalanceError,
    isLoading: isBalanceLoading
  } = useBalance({
    address: smartAccountAddress as `0x${string}`,
    query: {
      enabled: !!smartAccountAddress && smartAccountAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Contract reads - only if smart account exists
  const { 
    data: _taskCount,
    isError: isTaskCountError,
    isLoading: isTaskCountLoading
  } = useReadContract({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    functionName: "getTotalTasks",
    query: {
      enabled: !!smartAccountAddress && smartAccountAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const { 
    data: _commitedFunds, 
    refetch: commitedFundsrefetch,
    isError: isCommittedFundsError,
    isLoading: isCommittedFundsLoading
  } = useReadContract({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    functionName: "s_totalCommittedReward",
    query: {
      enabled: !!smartAccountAddress && smartAccountAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  const { 
    data: tasks, 
    refetch: taskRefetch,
    isError: isTasksError,
    isLoading: isTasksLoading
  } = useReadContract({
    address: smartAccountAddress as `0x${string}`,
    abi: SMART_ACCOUNT_ABI,
    functionName: "getAllTasks",
    query: {
      enabled: !!smartAccountAddress && smartAccountAddress !== "0x0000000000000000000000000000000000000000",
    },
  });

  // Write contracts
  const { data: createTaskHash, writeContract: useWriteCreateTask } = useWriteContract();
  const { isSuccess: isCreateTaskSuccess, isError: isCreateTaskError } = useTransactionReceipt({
    hash: createTaskHash,
  });

  const { data: completeTaskHash, writeContract: useWriteCompleteTask } = useWriteContract();
  const { isSuccess: isCompleteTaskSuccess, isError: isCompleteTaskError } = useTransactionReceipt({
    hash: completeTaskHash,
  });

  const { data: cancelTaskHash, writeContract: useWriteCancelTask } = useWriteContract();
  const { isSuccess: isCancelTaskSuccess, isError: isCancelTaskError } = useTransactionReceipt({
    hash: cancelTaskHash,
  });

  const { data: releasePaymentHash, writeContract: useWritereleasePayment } = useWriteContract();
  const { isSuccess: isReleasePaymentSuccess, isError: isReleasePaymentError } = useTransactionReceipt({ 
    hash: releasePaymentHash 
  });

  /*************************************************************************/
  /** 📡 HELPERS *****************************************************/
  /*************************************************************************/
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
  async function createTask() {
    // Validate smart account exists
    if (!smartAccountAddress || smartAccountAddress === "0x0000000000000000000000000000000000000000") {
      toast.error("Smart account not deployed. Please deploy your account first.");
      return;
    }

    const formValidity = validateTaskForm();
    if (formValidity !== true) {
      toast.error(formValidity);
      return;
    }
    
    setCreateTaskButton("Creating Task");

    // Clear any existing timeout
    if (createTaskTimeoutId) {
      clearTimeout(createTaskTimeoutId);
    }

    // Set a timeout to reset the button state
    const timeoutId = setTimeout(() => {
      setCreateTaskButton("Create Task");
      toast.error("Transaction timed out. Please try again.");
    }, 15000);

    setCreateTaskTimeoutId(timeoutId);

    const deadlineInSeconds = deadline
      ? BigInt(Math.floor(deadline.getTime() / 1000) - Math.floor(Date.now() / 1000))
      : BigInt(0);

    try {
      await useWriteCreateTask({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "createTask",
        args: [
          taskDescription,
          parseEther(rewardAmount),
          deadlineInSeconds,
          penaltyType === PenaltyType.DELAY_PAYMENT ? 1 : 2,
          penaltyType === PenaltyType.SEND_BUDDY
            ? (buddyAddress as `0x${string}`)
            : "0x0000000000000000000000000000000000000000",
          penaltyType === PenaltyType.DELAY_PAYMENT
            ? BigInt(parseInt(delayDuration) * 3600)
            : BigInt(0),
        ],
      });
    } catch (error) {
      console.log(error);
      if (timeoutId) {
        clearTimeout(timeoutId);
        setCreateTaskTimeoutId(null);
      }
      setCreateTaskButton("Create Task");
      toast.error("Transaction failed. Please try again.");
    }
  }

  async function completeTask(id: bigint) {
    if (!smartAccountAddress || taskCount === 0) {
      toast.error("No tasks available or smart account not found");
      return;
    }

    const taskId = id.toString();
    setCompletingTasks((prev) => new Set([...prev, taskId]));

    const timeoutId = setTimeout(() => {
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      setCompleteTaskTimeouts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      toast.error("Transaction timed out. Please try again.");
    }, 15000);

    setCompleteTaskTimeouts((prev) => new Map([...prev, [taskId, timeoutId]]));

    try {
      await useWriteCompleteTask({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "completeTask",
        args: [id],
      });
    } catch (error) {
      console.log(error);
      const timeoutToClear = completeTaskTimeouts.get(taskId);
      if (timeoutToClear) {
        clearTimeout(timeoutToClear);
        setCompleteTaskTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(taskId);
          return newMap;
        });
      }
      setCompletingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      toast.error("Transaction failed. Please try again.");
    }
  }

  async function cancelTask(id: bigint) {
    if (!smartAccountAddress || taskCount === 0) {
      toast.error("No tasks available or smart account not found");
      return;
    }

    const taskId = id.toString();
    setCancelingTasks((prev) => new Set([...prev, taskId]));

    const timeoutId = setTimeout(() => {
      setCancelingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      setCancelTaskTimeouts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      toast.error("Transaction timed out. Please try again.");
    }, 15000);

    setCancelTaskTimeouts((prev) => new Map([...prev, [taskId, timeoutId]]));

    try {
      await useWriteCancelTask({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "cancelTask",
        args: [id],
      });
    } catch (error) {
      console.log(error);
      const timeoutToClear = cancelTaskTimeouts.get(taskId);
      if (timeoutToClear) {
        clearTimeout(timeoutToClear);
        setCancelTaskTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(taskId);
          return newMap;
        });
      }
      setCancelingTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      toast.error("Transaction failed. Please try again.");
    }
  }

  async function releasePayment(id: bigint) {
    if (!smartAccountAddress || taskCount === 0) {
      toast.error("No tasks available or smart account not found");
      return;
    }

    const taskId = id.toString();
    setReleasingPayment((prev) => new Set([...prev, taskId]));

    const timeoutId = setTimeout(() => {
      setReleasingPayment((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      setReleasePaymentTimeouts((prev) => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      toast.error("Transaction timed out. Please try again.");
    }, 15000);

    setReleasePaymentTimeouts((prev) => new Map([...prev, [taskId, timeoutId]]));

    try {
      await useWritereleasePayment({
        address: smartAccountAddress as `0x${string}`,
        abi: SMART_ACCOUNT_ABI,
        functionName: "releaseDelayedPayment",
        args: [id],
      });
    } catch (error) {
      console.log(error);
      const timeoutToClear = releasePaymentTimeouts.get(taskId);
      if (timeoutToClear) {
        clearTimeout(timeoutToClear);
        setReleasePaymentTimeouts((prev) => {
          const newMap = new Map(prev);
          newMap.delete(taskId);
          return newMap;
        });
      }
      setReleasingPayment((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      toast.error("Failed to release payment. Please try again.");
    }
  }

  // Helper functions to check if a specific task is being operated on
  const isTaskCompleting = (taskId: bigint) => completingTasks.has(taskId.toString());
  const isTaskCanceling = (taskId: bigint) => cancelingTasks.has(taskId.toString());
  const releasePaymentInProgress = (taskId: bigint) => releasingPayment.has(taskId.toString());

  /*************************************************************************/
  /** 📡 SIDE EFFECTS *****************************************************/
  /*************************************************************************/

  // Handle transaction successes
  useEffect(() => {
    if (isCreateTaskSuccess) {
      if (createTaskTimeoutId) {
        clearTimeout(createTaskTimeoutId);
        setCreateTaskTimeoutId(null);
      }
      
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      setCreateTaskButton("Task Created");
      setLocalSuccess(true);
      toast.success("Task Created successfully");
    }
  }, [isCreateTaskSuccess, createTaskTimeoutId, taskRefetch, balanceRefetch, commitedFundsrefetch]);

  useEffect(() => {
    if (isCompleteTaskSuccess) {
      completeTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      setCompleteTaskTimeouts(new Map());
      
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      setCompletingTasks(new Set());
      toast.success("Task completed successfully!");
    }
  }, [isCompleteTaskSuccess, completeTaskTimeouts, taskRefetch, balanceRefetch, commitedFundsrefetch]);

  useEffect(() => {
    if (isCancelTaskSuccess) {
      cancelTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      setCancelTaskTimeouts(new Map());
      
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      setCancelingTasks(new Set());
      toast.info("Task canceled successfully!");
    }
  }, [isCancelTaskSuccess, cancelTaskTimeouts, taskRefetch, balanceRefetch, commitedFundsrefetch]);

  useEffect(() => {
    if (isReleasePaymentSuccess) {
      releasePaymentTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      setReleasePaymentTimeouts(new Map());
      
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      setReleasingPayment(new Set());
      toast.info("Payment Released Successfully");
    }
  }, [isReleasePaymentSuccess, releasePaymentTimeouts, taskRefetch, balanceRefetch, commitedFundsrefetch]);

  // Handle transaction errors
  useEffect(() => {
    if (isCreateTaskError) {
      if (createTaskTimeoutId) {
        clearTimeout(createTaskTimeoutId);
        setCreateTaskTimeoutId(null);
      }
      setCreateTaskButton("Create Task");
      toast.error("Transaction failed. Please try again.");
    }
  }, [isCreateTaskError, createTaskTimeoutId]);

  useEffect(() => {
    if (isCompleteTaskError) {
      setCompletingTasks(new Set());
      toast.error("Failed to complete task. Please try again.");
    }
  }, [isCompleteTaskError]);

  useEffect(() => {
    if (isCancelTaskError) {
      setCancelingTasks(new Set());
      toast.error("Failed to cancel task. Please try again.");
    }
  }, [isCancelTaskError]);

  useEffect(() => {
    if (isReleasePaymentError) {
      setReleasingPayment(new Set());
      toast.error("Failed to release payment. Please try again.");
    }
  }, [isReleasePaymentError]);

  // Set refetch functions in data store
  useEffect(() => {
    setaccountBalanceRefetch(balanceRefetch);
    setCommitedFundsRefetch(commitedFundsrefetch);
  }, [balanceRefetch, commitedFundsrefetch, setaccountBalanceRefetch, setCommitedFundsRefetch]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (createTaskTimeoutId) {
        clearTimeout(createTaskTimeoutId);
      }
      completeTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      cancelTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      releasePaymentTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    };
  }, [createTaskTimeoutId, completeTaskTimeouts, cancelTaskTimeouts, releasePaymentTimeouts]);

  /*************************************************************************/
  /** 🎯 RETURN API *******************************************************/
  /*************************************************************************/
  return {
    // UI State
    showCreateTask,
    setShowCreateTask,
    activeTab,
    setActiveTab,
    createTaskButton,
    setCreateTaskButton,

    // Form State
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

    // Data
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

    // Loading states
    isDisabled: isDisabled as boolean | undefined,
    isTaskCompleting,
    isTaskCanceling,
    releasePaymentInProgress,
    completingTasks,
    cancelingTasks,

    // Actions
    createTask,
    completeTask,
    cancelTask,
    releasePayment,

    // Addresses
    TaskManagerAddress,
    smartAccountAddress,

    // UI helpers
    isSideBarOpen,
    copyToClipboard,
    truncateAddress,
    formattedPersonalBalance,
    localSuccess,
    setLocalSuccess,

    // Transaction status
    isCompleteTaskSuccess,
    isCancelTaskSuccess,

    // Loading states for contract reads
    isDataLoading: isBalanceLoading || isTaskCountLoading || isCommittedFundsLoading || isTasksLoading,
    hasErrors: isBalanceError || isTaskCountError || isCommittedFundsError || isTasksError,
  };
}