"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { WalletSidebar } from "@/components/wallet-sidebar"
import { useAddressStore } from "../lib/store/addressStore";
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import TasksList from "@/components/section-Tasktable";
import { usePrivy } from "@privy-io/react-auth";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Loader2 } from "lucide-react";


/*//////////////////////////////////////////////////////////////
                                TYPES
//////////////////////////////////////////////////////////////*/

export default function Dashboard() {
  /*//////////////////////////////////////////////////////////////
                                STATES
//////////////////////////////////////////////////////////////*/

  //UI

  /*//////////////////////////////////////////////////////////////
                           HOOKS
//////////////////////////////////////////////////////////////*/
  const router = useRouter();
  const smartAccountAddress = useAddressStore(
    (state) => state.SmartAccountAddress
  );
  /*//////////////////////////////////////////////////////////////
                            CUSTOM HOOKS
//////////////////////////////////////////////////////////////*/

const {authenticated,ready}=usePrivy()

  /*//////////////////////////////////////////////////////////////
                             FUNCTIONS
//////////////////////////////////////////////////////////////*/

  /*//////////////////////////////////////////////////////////////
                              USEEFFECTS
  //////////////////////////////////////////////////////////////*/
  useEffect(()=>{
    if (ready && !authenticated && !smartAccountAddress ) {
      router.push("/");
    }
  },[authenticated,ready])

  /*//////////////////////////////////////////////////////////////
                              JSX
  //////////////////////////////////////////////////////////////*/


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 95)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col  ">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 px-6 lg:px-8   py-4 md:gap-6 md:py-6">
              <SectionCards />
              <TasksList />
            </div>
          </div>
        </div>
      </SidebarInset>
            <WalletSidebar variant="inset" side="right" />
    </SidebarProvider>
  );
}
