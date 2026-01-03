import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Import dynamically to avoid Edge Runtime issues in middleware
        const bcrypt = await import("bcryptjs");
        const { getUserByEmail, updateLastLogin } = await import("./db/queries/users");

        const user = await getUserByEmail(credentials.email as string);
        
        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );

        if (!passwordMatch) {
          return null;
        }

        await updateLastLogin(user.id);

        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          firstName: user.first_name,
          lastName: user.last_name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const userWithNames = user as typeof user & { firstName?: string; lastName?: string };
        token.firstName = userWithNames.firstName;
        token.lastName = userWithNames.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        const userWithNames = session.user as typeof session.user & { firstName?: string; lastName?: string };
        userWithNames.firstName = token.firstName as string | undefined;
        userWithNames.lastName = token.lastName as string | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

