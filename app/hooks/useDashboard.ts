"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAddressStore } from "../lib/store/addressStore";
import { useUiStore } from "../lib/store/UIStore";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { SMART_ACCOUNT_ABI } from "../lib/contracts";
import { encodeFunctionData, formatUnits, parseEther } from "viem";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { useDataStore } from "../lib/store/dataStore";
import { useDashboardHelper } from "./useDashboardHelper";
import { TaskType } from "../types/types";
import { PenaltyType } from "../types/types";
import { useSmartAccount } from "../lib/useSmartAccount";

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
  const { setRefetchAccountbalance, setRefetchCommittedFunds } = useDataStore(
    useShallow((state) => ({
      setRefetchAccountbalance: state.setRefetchAccountbalance,
      setRefetchCommittedFunds: state.setRefetchCommittedFunds,
    }))
  );
  const isSideBarOpen = useUiStore((state) => state.isSideWalletOpen);
  /*************************************************************************/
  /** 🪝 WAGMI / OTHER HOOKS **********************************************/
  /*************************************************************************/
  const { smartAccountClient } = useSmartAccount();

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
  const resetTaskForm = () => {
    setTaskDescription("");
    setRewardAmount("");
    setDeadline(undefined);
    setDelayDuration("");
    setBuddyAddress("");
    setPenaltyType(PenaltyType.UNDEFINED);
  };

  async function createTask() {
    const formValidity = validateTaskForm();
    if (formValidity !== true) {
      // Use the specific error message from the validation function
      toast.error(formValidity);
      return;
    }
    if (!smartAccountClient?.account || !smartAccountAddress) {
      toast.error("Smart account not ready.");
      return;
    }

    setCreateTaskButton("Creating Task");

    try {
      const deadlineInSeconds = deadline
        ? BigInt(Math.floor(deadline.getTime() / 1000))
        : BigInt(0);

      const callData = encodeFunctionData({
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
            ? BigInt(parseInt(delayDuration) * 86400)
            : BigInt(0),
        ],
      });

      const hash = await smartAccountClient.sendUserOperation({
        account: smartAccountClient.account,
        calls: [
          {
            to: smartAccountAddress,
            data: callData,
            value: parseEther(rewardAmount),
          },
        ],
      });

      await smartAccountClient.waitForUserOperationReceipt({ hash });

      toast.success("Task created successfully!");
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
      resetTaskForm();
      setShowCreateTask(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please try again.");
    } finally {
      setCreateTaskButton("Create Task");
    }
  }

  async function completeTask(id: bigint) {
    if (taskCount == 0) {
      console.log("no tasks available");
      return;
    }
    if (!smartAccountClient?.account || !smartAccountAddress) {
      toast.error("Smart account not ready.");
      return;
    }

    const taskId = id.toString();
    setCompletingTasks((prev) => new Set([...prev, taskId]));

    try {
      const callData = encodeFunctionData({
        abi: SMART_ACCOUNT_ABI,
        functionName: "completeTask",
        args: [id],
      });
      const hash = await smartAccountClient.sendUserOperation({
        account: smartAccountClient.account,
        calls: [{ to: smartAccountAddress, data: callData, value: 0n }],
      });
      await smartAccountClient.waitForUserOperationReceipt({ hash });

      toast.success("Task completed successfully!");
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
    } catch (error) {
      console.error("Failed to complete task:", error);
      toast.error("Failed to complete task. Please try again.");
    } finally {
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
    if (!smartAccountClient?.account || !smartAccountAddress) {
      toast.error("Smart account not ready.");
      return;
    }

    const taskId = id.toString();
    setCancelingTasks((prev) => new Set([...prev, taskId]));

    try {
      const callData = encodeFunctionData({
        abi: SMART_ACCOUNT_ABI,
        functionName: "cancelTask",
        args: [id],
      });
      const hash = await smartAccountClient.sendUserOperation({
        account: smartAccountClient.account,
        calls: [{ to: smartAccountAddress, data: callData, value: 0n }],
      });
      await smartAccountClient.waitForUserOperationReceipt({ hash });

      toast.success("Task canceled successfully!");
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
    } catch (error) {
      console.error("Failed to cancel task:", error);
      toast.error("Failed to cancel task. Please try again.");
    } finally {
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
    if (!smartAccountClient?.account || !smartAccountAddress) {
      toast.error("Smart account not ready.");
      return;
    }

    const taskId = id.toString();
    setReleasingPayment((prev) => new Set([...prev, taskId]));

    try {
      const callData = encodeFunctionData({
        abi: SMART_ACCOUNT_ABI,
        functionName: "releaseDelayedPayment",
        args: [id],
      });
      const hash = await smartAccountClient.sendUserOperation({
        account: smartAccountClient.account,
        calls: [{ to: smartAccountAddress, data: callData, value: 0n }],
      });
      await smartAccountClient.waitForUserOperationReceipt({ hash });
      toast.success("Payment released successfully!");
      taskRefetch();
      balanceRefetch();
      commitedFundsrefetch();
    } catch (error) {
      console.error("Failed to release payment:", error);
      toast.error("Failed to release payment. Please try again.");
    } finally {
      setReleasingPayment((prev) => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
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
    setRefetchAccountbalance(balanceRefetch);
    setRefetchCommittedFunds(commitedFundsrefetch);
  }, [_accountBalance, _commitedFunds]);

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
    smartAccountAddress,
    isSideBarOpen,
    copyToClipboard,
    truncateAddress,
    formattedPersonalBalance,
    localSuccess,
    isTaskCompleting,
    isTaskCanceling,
    releasePaymentInProgress,
    completingTasks,
    cancelingTasks,
  };
}
