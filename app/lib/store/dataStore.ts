import { create } from "zustand";
import { persist } from "zustand/middleware";

type PersistDataStateType = {
  accountBalance: string | null;
  commitedFunds: string | null;
  taskCount: string | null;
};
type DataStateType = {
  refetchAccountbalance?: () => void;
  setRefetchAccountbalance: (refetchFn: () => void) => void;
  refetchCommittedFunds?: () => void;
  setRefetchCommittedFunds: (refetchFn: () => void) => void;
};
export const usePersistDataStore = create<PersistDataStateType>()(
  persist(
    (set) => ({
      accountBalance: null,
      commitedFunds: null,
      taskCount: null,
      setAccountBalance: (balance: string) => set({ accountBalance: balance }),
    }),
    {
      name: "data-storage",
      partialize: (state) => ({
        accountBalance: state.accountBalance,
        commitedFunds: state.commitedFunds,
        taskCount: state.taskCount,
      }),
    }
  )
);

export const useDataStore = create<DataStateType>()((set) => ({
  refetchAccountbalance: undefined,
  setRefetchAccountbalance: (refetchFn) =>
    set({ refetchAccountbalance: refetchFn }),
  refetchCommittedFunds: undefined,
  setRefetchCommittedFunds: (refetchFn) =>
    set({ refetchCommittedFunds: refetchFn }),
}));
