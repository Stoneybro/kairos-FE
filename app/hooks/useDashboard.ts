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
import { error } from "console";

/*************************************************************************/
/** 🧩 TYPES *************************************************************/
/*************************************************************************/
/**
 *
 * @dev break down this hook, its too large
 */
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
  const [createTaskTimeoutId, setCreateTaskTimeoutId] =
    useState<NodeJS.Timeout | null>(null);
  const [completeTaskTimeouts, setCompleteTaskTimeouts] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());
  const [cancelTaskTimeouts, setCancelTaskTimeouts] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());
  const [releasePaymentTimeouts, setReleasePaymentTimeouts] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());
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
  /**
   *
   * @dev // rewrite useWriteContract to use only useWriteContract hook, use state to save the hashes
   */
  const { data: createTaskHash, writeContract: useWriteCreateTask } =
    useWriteContract();
  const { isSuccess: isCreateTaskSuccess, isError: isCreateTaskError } =
    useTransactionReceipt({
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

  /**
   * @dev removed this because of the rpc calls
   */

  // useWatchContractEvent({
  //   address: smartAccountAddress as `0x${string}`,
  //   abi: SMART_ACCOUNT_ABI,
  //   eventName: "TaskExpired",
  //   onLogs: debounce((logs) => {
  //     taskRefetch();
  //     balanceRefetch();
  //     commitedFundsrefetch();
  //     toast.info("Task Expired");
  //   }, 1000)
  // });

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
    toast.error(formValidity);
    return;
  }
  setCreateTaskButton("Creating Task");

  // Clear any existing timeout
  if (createTaskTimeoutId) {
    clearTimeout(createTaskTimeoutId);
  }

  // Set a timeout to reset the button state (10 seconds)
  const timeoutId = setTimeout(() => {
    setCreateTaskButton("Create Task");
    toast.error("Transaction timed out. Please try again.");
  }, 15000);

  setCreateTaskTimeoutId(timeoutId);

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
    // Clear timeout on immediate error
    if (timeoutId) {
      clearTimeout(timeoutId);
      setCreateTaskTimeoutId(null);
    }
    setCreateTaskButton("Create Task");
    toast.error("Transaction failed. Please try again.");
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

  // Set timeout for this specific task (10 seconds)
  const timeoutId = setTimeout(() => {
    setCompletingTasks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    // Also remove from timeout map
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
    // Clear timeout and reset state on immediate error
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
  if (taskCount == 0) {
    console.log("no tasks available");
    return;
  }

  const taskId = id.toString();

  // Add task to canceling set
  setCancelingTasks((prev) => new Set([...prev, taskId]));

  // Set timeout for this specific task (10 seconds)
  const timeoutId = setTimeout(() => {
    setCancelingTasks((prev) => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    // Also remove from timeout map
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
    // Clear timeout and reset state on immediate error
    const timeoutToClear = cancelTaskTimeouts.get(taskId); // Fixed: was using completeTaskTimeouts
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

async function releasePayment(id: bigint) { // Fixed: changed parameter type to bigint
  if (taskCount == 0) {
    console.log("no tasks available");
    return;
  }

  const taskId = id.toString();

  // Add task to releasing payment set
  setReleasingPayment((prev) => new Set([...prev, taskId]));

  // Set timeout for this specific task (10 seconds)
  const timeoutId = setTimeout(() => {
    setReleasingPayment((prev) => { // Fixed: was using setCancelingTasks
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    // Also remove from timeout map
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
      args: [id], // Fixed: use id directly, not BigInt(taskId)
    });
  } catch (error) {
    console.log(error);
    // Clear timeout and reset state on immediate error
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

  
// Update your existing useEffect handlers to clear timeouts

useEffect(() => {
  if (isCreateTaskSuccess) {
    // Clear the timeout since transaction succeeded
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
}, [isCreateTaskSuccess]);

useEffect(() => {
  if (isCompleteTaskSuccess) {
    // Clear all completion timeouts since we don't know which task completed
    completeTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    setCompleteTaskTimeouts(new Map());
    
    taskRefetch();
    balanceRefetch();
    commitedFundsrefetch();
    setCompletingTasks(new Set());
    toast.success("Task completed successfully!");
  }
}, [isCompleteTaskSuccess]);

useEffect(() => {
  if (isCancelTaskSuccess) {
    // Clear all cancel timeouts
    cancelTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    setCancelTaskTimeouts(new Map());
    
    taskRefetch();
    balanceRefetch();
    commitedFundsrefetch();
    setCancelingTasks(new Set());
    toast.info("Task canceled successfully!");
  }
}, [isCancelTaskSuccess]);

useEffect(() => {
  if (isReleasePaymentSuccess) {
    // Clear all release payment timeouts
    releasePaymentTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    setReleasePaymentTimeouts(new Map());
    
    taskRefetch();
    balanceRefetch();
    commitedFundsrefetch();
    setReleasingPayment(new Set());
    toast.info("Payment Released Successfully");
  }
}, [isReleasePaymentSuccess]);

// Add cleanup effect for component unmount
useEffect(() => {
  return () => {
    if (createTaskTimeoutId) {
      clearTimeout(createTaskTimeoutId);
    }
    completeTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    cancelTaskTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
    releasePaymentTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  };
}, []);

  useEffect(() => {
    setaccountBalanceRefetch(balanceRefetch);
    setCommitedFundsRefetch(commitedFundsrefetch);
  }, [
    balanceRefetch,
    commitedFundsrefetch,
    setaccountBalanceRefetch,
    setCommitedFundsRefetch,
  ]);
  useEffect(() => {
    if (isCreateTaskError) {
      setCreateTaskButton("Create Task");
      toast.error("Transaction failed. Please try again.");
    }
  }, [isCreateTaskError]);

  // Similarly for other transactions
  useEffect(() => {
    if (isCompleteTaskError) {
      // Remove from completing set on error
      setCompletingTasks(new Set());
      toast.error("Failed to complete task. Please try again.");
    }
  }, [isCompleteTaskError]);

  useEffect(() => {
    if (isCancelTaskError) {
      // Remove from canceling set on error
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
  /*************************************************************************/
  /** 🎯 RETURN API *******************************************************/
  /*************************************************************************/
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
    setLocalSuccess,
    isCompleteTaskSuccess,
    isCancelTaskSuccess,
    isTaskCompleting,
    isTaskCanceling,
    releasePaymentInProgress,
    completingTasks,
    cancelingTasks,
  };
}
