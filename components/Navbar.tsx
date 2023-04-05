import clsx from 'clsx';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import Button from './Button';
import { useProtected } from 'hooks/useProtected';
import { connect, signMessage } from '@wagmi/core';
import { SiweMessage } from 'siwe';
import { useAccount, useConnect } from 'wagmi';

interface NavbarProps {
  className?: string;
}

const Navbar = ({ className }: NavbarProps) => {
  const { data: session, status } = useSession();
  const connectData = useConnect();
  const { isConnected, address } = useAccount();
  const handleSignout = useProtected();

  const classNames = clsx(
    className,
    'h-20 bg-gray-300 w-full flex items-center z-20 fixed top-0'
  );

  const handleSignin = async () => {
    try {
      const account = await connect({ connector: connectData.connectors[0] });
      const callbackUrl = '/protected';
      const message = new SiweMessage({
        domain: window.location.host,
        address: account.account,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: account.chain.id,
        nonce: await getCsrfToken(),
      });
      const signature = await signMessage({
        message: message.prepareMessage(),
      });
      signIn('credentials', {
        message: JSON.stringify(message),
        redirect: false,
        signature,
        callbackUrl,
      });
    } catch (error) {
      window.alert(error);
    }
  };

  return (
    <nav className={classNames}>
      <div className="w-screen max-w-5xl mx-auto flex justify-between align-center">
        <div className="flex-1"></div>
        <div>
          {isConnected && status === 'authenticated' ? (
            <span className="mr-4">
              {address?.substring(0, 4)}...
              {address?.substring(address.length - 3)}
            </span>
          ) : null}
          {isConnected && status === 'authenticated' ? (
            <Button
              className="px-3"
              buttonType="light"
              label="SignOut"
              onClick={handleSignout}
            />
          ) : (
            <div className="flex gap-2">
              <Button
                className="w-fit px-3"
                buttonType="light"
                label="Connect"
                onClick={handleSignin}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
