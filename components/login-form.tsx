import { cn } from "@/lib/utils";
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
    <div className={cn("flex flex-col gap-6")} {...props}>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-2xl font-bold'>Login to your account</h1>
        <p className='text-muted-foreground text-sm text-balance'>
          Get Started by choosing an option below
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

      </div>
    </div>
  );
}
