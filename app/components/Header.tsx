"use client"
import React from 'react';
import { CustomConnectButton } from './ui/ConnectButton';
import logo from "../../public/logo.svg";
import Image from 'next/image'

export const Header = () => {

  return (
    <header className="bg-[#19191A] sticky top-0 border-b-[1px] border-[#2A2A2A] text-foreground px-6 py-4 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo Section */}
        <div className="flex items-center  space-x-2">
        <span><Image src={logo} alt='kairos logo' width={20} height={20} /></span>
          <span className="text-xl font-bold tracking-wide text-muted ">KAIROS</span>
        </div>

   <CustomConnectButton />
      </div>
    </header>
  );
};