import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) return null;

                const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

                if (!user) return null;

                const passwordMatch = await bcrypt.compare(password, user.passwordHash);
                if (!passwordMatch) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role: string }).role;
            }
            if (!token.role && token.sub) {
                const [dbUser] = await db
                    .select({ role: users.role })
                    .from(users)
                    .where(eq(users.id, token.sub))
                    .limit(1);
                if (dbUser) token.role = dbUser.role;
            }
            return token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.role = token.role as string;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    }
});
