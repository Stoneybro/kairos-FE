"use client"
import { RiHome6Fill } from "react-icons/ri";
import { AiFillClockCircle } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { activeTabType } from "@/app/types/types";
type tabType = {
setTab: (state: activeTabType) => void;
};
export function SidebarFooter( {setTab}: tabType ) {
  return (
    <div className="w-full h-full flex items-start justify-center ">
    <ToggleGroup type="single" className="w-[60%] " >
      <ToggleGroupItem onClick={() => setTab("home")} className="" value="bold" aria-label="Toggle bold">
        <RiHome6Fill  className="!h-6 !w-6" />
      </ToggleGroupItem>
      <ToggleGroupItem onClick={() => setTab("activity")} value="italic" aria-label="Toggle italic" >
        <AiFillClockCircle  className="!h-6 !w-6" />
      </ToggleGroupItem>
      <ToggleGroupItem onClick={() => setTab("settings")} value="strikethrough" aria-label="Toggle strikethrough">
        <IoSettings  className="!h-6 !w-6"/>
      </ToggleGroupItem>
    </ToggleGroup>
    </div>
  )
}
