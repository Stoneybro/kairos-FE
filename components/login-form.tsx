"use client"
import { Button } from "@/components/ui/button";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { Loader2, Mail, Wallet } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export function LoginForm({

  ...props
}) {
  const { ready, authenticated } = usePrivy();
  const {login} = useLogin();
  //redundant
  const disableLogin = !ready || (ready && authenticated);
  if (!ready) {
    return <div className="flex justify-center items-center"><Loader2 className="animate-spin h-10 w-10" /></div>
  }
  return (
    <div className="flex flex-col gap-6" {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Login to your account</h1>
        <p className='text-muted-foreground text-sm text-balance'>
          Enter your email below to login to your account
        </p>
      </div>
      <div className='grid gap-6'>
        <Button disabled={authenticated} onClick={() => login({loginMethods:["google"]})} variant='outline' className='w-full'>
          <FaGoogle />
          Login with Google
        </Button>
        <Button disabled={authenticated} onClick={() => login({loginMethods:["email"]})} variant='outline' className='w-full flex items-center'>
          <Mail />
          Login with Mail
        </Button>
        <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
          <span className='bg-background text-muted-foreground relative z-10 px-2'>
            Or continue with
          </span>
        </div>
        <Button
          variant='outline'
          className='w-full flex items-center'
          disabled={disableLogin}
          onClick={() =>
            login({
              loginMethods: ["wallet"],
              walletChainType: "ethereum-only",
            })
          }
        >
          <Wallet />
          wallet
        </Button>
      </div>
      <div className='text-center text-sm'>
        Don&apos;t have an account?{" "}
        <a href='#' className='underline underline-offset-4'>
          Sign up
        </a>
      </div>
    </div>
  );
}
