import { ITeacher } from "@/models/teacher";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: Pick<ITeacher, "id" | "name" | "email" | "avatar"> & {
      emailVerified?: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: Pick<ITeacher, "id" | "name" | "email" | "avatar">;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // If signing in for the first time, set user details
      if (user) {
        token.user = {
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          avatar: user.image || "/images/cat-guest.png",
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.user.id,
        name: token.user.name,
        email: token.user.email,
        avatar: token.user.avatar,
        emailVerified: new Date(),
      };
      return session;
    },
  },
});
