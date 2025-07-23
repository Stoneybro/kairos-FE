"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUiStore } from "@/app/lib/store/UIStore";
export const CustomConnectButton = () => {
  const openSideBar = useUiStore((state) => state.openSideWallet);
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        openChainModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className=''
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className='px-4 py-2 rounded text-tag-expired '
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className='flex items-center gap-2 lg:gap-6'>
                  <button
                    onClick={openChainModal}
                    className=' '
                  >
                    {chain.name}
                  </button>
                  <button
                    onClick={openSideBar}
                    className='  '
                  >
                    ${account.displayBalance} 
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
