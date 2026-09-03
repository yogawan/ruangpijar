// auth.ts
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : null;
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : null;

        if (!email || !password) return null;

        await connectDB();
        const user = await UserModel.findOne({ email }).select("+passwordHash");
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && !user.email) return false;
      return true;
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google" && user.email) {
        await connectDB();
        const email = user.email.toLowerCase();
        let dbUser = await UserModel.findOne({ email });

        if (!dbUser) {
          dbUser = await UserModel.create({
            name: user.name ?? email.split("@")[0],
            email,
            avatarUrl: user.image ?? null,
            googleId: account.providerAccountId,
          });
        } else if (!dbUser.googleId) {
          dbUser.googleId = account.providerAccountId;
          await dbUser.save();
        }

        token.userId = dbUser._id.toString();
      } else if (user) {
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
