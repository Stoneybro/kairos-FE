import { create } from "zustand";
import { persist } from "zustand/middleware";

type AddressStateType = {
  SmartAccountAddress: `0x${string}` | null;
  TaskManagerAddress: `0x${string}` | null;
  setSmartAccountAddress: (address: `0x${string}` | null) => void;
  setTaskManagerAddress: (address: `0x${string}` | null) => void;
};

export const useAddressStore = create<AddressStateType>()(
  persist(
    (set) => ({
      SmartAccountAddress: null,
      TaskManagerAddress: null,
      setSmartAccountAddress: (address) =>
        set((state) => ({ ...state, SmartAccountAddress: address })),
      setTaskManagerAddress: (address) =>
        set((state) => ({ ...state, TaskManagerAddress: address })),
    }),
    {
      name: "address-storage",
      partialize: (state) => ({
        SmartAccountAddress: state.SmartAccountAddress,
        TaskManagerAddress: state.TaskManagerAddress,
      }),
    }
  )
);
