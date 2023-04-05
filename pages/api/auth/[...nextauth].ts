import { createHash } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const providers = [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0',
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0',
        },
      },
      async authorize(credentials) {
        try {
          if (!process.env.NEXTAUTH_URL) {
            throw 'NEXTAUTH_URL is not set';
          }
          if (!credentials) {
            return null;
          }
          // the siwe message follows a predictable format
          const siwe = new SiweMessage(JSON.parse(credentials.message || '{}'));
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
          if (siwe.domain !== nextAuthUrl.host) {
            console.log('return null domain');
            return null;
          }

          // validate the nonce
          if (!verifyNextAuthCsrfToken(req, siwe.nonce)) {
            return null;
          }
          // siwe will validate that the message is signed by the address
          await siwe.validate(credentials.signature);
          return {
            id: siwe.address,
          };
        } catch (e) {
          return null;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === 'GET' && req.query.nextauth?.includes('signin');

  if (isDefaultSigninPage) {
    providers.pop();
  }

  return await NextAuth(req, res, {
    providers,
    session: {
      strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      // after a user is logged in, we can keep the address in session
      async session({ session, token }) {
        session.address = token.sub;
        session.user!.name = token.sub;
        return session;
      },
    },
  });
}

const verifyNextAuthCsrfToken = (req: NextApiRequest, tokenToCheck: string) => {
  const secret: string = process.env.NEXTAUTH_SECRET || '';
  const csrfMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!csrfMethods.includes(req.method || '')) {
    // we dont need to check the CSRF if it's not within the method.
    return true;
  }

  try {
    const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://');
    const csrfProp = `${useSecureCookies ? '__Host-' : ''}next-auth.csrf-token`;

    if (req.cookies[csrfProp]) {
      const cookieValue = req.cookies[csrfProp];
      const cookieSplitKey = cookieValue?.match('|') ? '|' : '%7C';

      const [csrfTokenValue, csrfTokenHash] =
        cookieValue?.split(cookieSplitKey) || [];

      const generatedHash = createHash('sha256')
        .update(`${tokenToCheck}${secret}`)
        .digest('hex');

      if (csrfTokenHash === generatedHash) {
        // If hash matches then we trust the CSRF token value
        if (csrfTokenValue === tokenToCheck) return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};
