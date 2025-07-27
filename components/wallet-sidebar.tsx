import { Sidebar } from "@/components/ui/sidebar"
import { SidebarHeader } from "./wallet-sidebar-header"
import { SidebarFooter } from "./wallet-sidebar-footer"
import { useState } from "react";
import WalletSIdebarHome from "./wallet-sidebar-home";
import WalletSidebarActivity from "./wallet-sidebar-activity";
import WalletSidebarSettings from "./wallet-sidebar-settings";
import WalletSIdebarReceive from "./wallet-sidebar-receive";
import WalletSidebarDeposit from "./wallet-sidebar-deposit";
import WalletSidebarSend from "./wallet-sidebar-send";
import { useDashboard } from "@/app/hooks/useDashboard";

type activeTabType =
  | "home"
  | "activity"
  | "settings"
  | "receive"
  | "deposit"
  | "send";

export function WalletSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {availableBalance,smartAccountAddress,formattedPersonalBalance,accountBalance}=useDashboard();

    const [activeTab, setActiveTab] = useState<activeTabType>("home");
  return <Sidebar collapsible="offcanvas" {...props}>
    <div className="bg-background mx-auto my-auto h-[95vh] w-[95%] max-w-3xl rounded-xl">
    <div className="w-full h-[10%]  "><SidebarHeader activeTab={activeTab} setTab={setActiveTab} /></div>
    <div className="w-full h-[80%] flex flex-col relative">
    <div className="w-full h-full flex justify-center items-center">
    {activeTab === "home" && <WalletSIdebarHome setTab={setActiveTab}  />}
        {activeTab === "activity" && <WalletSidebarActivity/>}
        {activeTab === "settings" && <WalletSidebarSettings />}
        {activeTab === "receive" && <WalletSIdebarReceive/>}
        {activeTab === "deposit" && <WalletSidebarDeposit  />}
        {activeTab === "send" && <WalletSidebarSend  />}
    </div>
    <div className="text-sm text-gray-400 self-center absolute bottom-10">Deposit to get started</div>
    </div>
    
    <div className="w-full h-[10%] "><SidebarFooter setTab={setActiveTab} /></div>
    </div>
  </Sidebar>
}