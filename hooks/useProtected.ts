import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePrevious } from './usePrevious';
import { disconnect } from '@wagmi/core';

export function useProtected() {
  const accountData = useAccount();
  const session = useSession();
  const address = accountData?.address;
  const prevAddress = usePrevious(accountData?.address);

  const handleSignout = async () => {
    await signOut({ callbackUrl: '/' });
    await disconnect();
  };

  useEffect(() => {
    if (prevAddress && !address) {
      handleSignout();
    }
    if (session.status !== 'loading' && !address && prevAddress) {
      handleSignout();
    }
  }, [accountData, address]);

  return handleSignout;
}
