import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/dbConnect';
import User from '@/model/User';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        // Google OAuth
        // GoogleProvider({
        //     clientId: process.env.GOOGLE_CLIENT_ID as string,
        //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        // }),
        // Email/Password Authentication
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: any, req) : Promise<any> {
                await dbConnect();
                const user = await User.findOne({ email: credentials?.email });
                if (!user) throw new Error('User not found');

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) throw new Error('Invalid password');

                return { ...user.toObject(), redirect: false }; 
                // return user;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.user = user;
            return token;
        },
        async session({ session, token }) {
            session.user = token.user;
            return session;
        },
    },
    session: { strategy: 'jwt' },
    secret: process.env.JWT_SECRET,
};


