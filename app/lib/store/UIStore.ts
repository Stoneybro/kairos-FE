import {create} from "zustand"

type UiStateType={
    isSideWalletOpen:boolean,
    toggleSideWallet:(state:boolean)=>void;
    closeSideWallet:()=>void;
    openSideWallet:()=>void;
}

export const useUiStore=create<UiStateType>()(
    (set)=>({
        isSideWalletOpen:false,
        toggleSideWallet:()=>set((state)=>({isSideWalletOpen:!state.isSideWalletOpen})),
        closeSideWallet:()=> set ({isSideWalletOpen:false}),
        openSideWallet:()=>set({isSideWalletOpen:true}),
    })
)