import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "twoj@email.com" },
        password: { label: "Hasło", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user) {
          throw new Error("Nie znaleziono użytkownika.")
        }

        // Sprawdzenie hasła używając bcrypt
        const isValidPassword = await bcrypt.compare(credentials.password as string, user.password || "");
        if (!isValidPassword) {
          throw new Error("Nieprawidłowe hasło.");
        }

        return user
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
})
