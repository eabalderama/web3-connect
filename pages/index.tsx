import {
  getCsrfToken,
  getSession,
  signIn,
  signOut,
  useSession,
} from 'next-auth/react';
import { connect } from '@wagmi/core';
import { useAccount, useConnect, useNetwork, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { signMessage } from '@wagmi/core';
import { NextPageContext } from 'next';
import { useProtected } from 'hooks/useProtected';

export default function Home() {
  const { data: session, status } = useSession();
  const { isConnected, address } = useAccount();

  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      {isConnected && status === 'authenticated' ? (
        <strong>Address: {address}</strong>
      ) : null}
    </>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  console.log('session', session);
  if (!session) {
    return { props: {} };
  }
  return {
    props: {},
  };
}
