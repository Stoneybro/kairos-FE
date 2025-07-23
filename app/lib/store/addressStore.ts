import { create } from "zustand";
import { persist } from "zustand/middleware";

type AddressStateType = {
  SmartAccountAddress: `0x${string}` | null;
  setSmartAccountAddress: (address: `0x${string}` | null) => void;
 
};

export const useAddressStore = create<AddressStateType>()(
  persist(
    (set) => ({
      SmartAccountAddress: null,
      setSmartAccountAddress: (address) =>
        set((state) => ({ ...state, SmartAccountAddress: address })),
    }),
    {
      name: "address-storage",
      partialize: (state) => ({
        SmartAccountAddress: state.SmartAccountAddress,
      }),
    }
  )
);
