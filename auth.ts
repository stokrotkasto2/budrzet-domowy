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

        // W prawdziwej aplikacji sprawdzalibyśmy bcrypt.compare().
        // Tutaj dla prostoty (zanim dodamy panel rejestracji i szyfrowanie),
        // robimy mockową weryfikację jeśli poświadczenia nie pasują.
        if (!user) {
          throw new Error("Nie znaleziono użytkownika.")
        }

        // Zakładamy, że hasło jest trzymane w koncie 'Account' lub osobnym polu 'password' (musimy to dodać do schematu Prisma lub traktować to jako placeholder).
        // Na ten moment zwracamy null dopóki nie utworzymy rejestracji.
        return user
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
})
