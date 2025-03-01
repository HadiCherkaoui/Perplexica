import NextAuth, { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { NextApiRequest, NextApiResponse } from 'next';

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: '',
      clientSecret: ''
    })
  ],
  callbacks: {},
  secret: 'e0b14bd3568b501fec3566bb2a32299dd9aaba5e98220b778db3ffa750574b10',
  debug: true,
};

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
