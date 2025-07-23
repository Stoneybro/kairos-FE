import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import logo from "../public/logo.svg";
import { CustomConnectButton } from "@/app/components/ui/ConnectButton";
import { IoWalletOutline } from "react-icons/io5";

export function SiteHeader() {
   const {
    toggleSidebar,

  } = useSidebar()
  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
                <span><Image src={logo} color="black" alt='kairos logo' width={20} height={20} /></span>
        <h1 className='text-base font-medium '>KAIROS</h1>
        <div className="flex items-center gap-2 lg:gap-4 ml-auto">
    
                <Separator
          orientation='vertical'
          className='ml-2 data-[orientation=vertical]:h-4 '
        />

          <Button onClick={toggleSidebar} variant="ghost"  >
            <IoWalletOutline className="w-6! h-6!" />
          </Button>

</div>
      
        
      </div>
    </header>
  );
}
