"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function requestPasswordReset(email: string) {
  if (!email) return { error: "Email jest wymagany" }

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    // Dla bezpieczeństwa nie mówimy czy user istnieje, 
    // ale w domowym budżecie możemy być bardziej dosłowni
    return { error: "Nie znaleziono użytkownika z tym adresem email" }
  }

  // Generuj 6-cyfrowy kod
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 3600000) // 1 godzina

  // Usuń stare tokeny dla tego emaila
  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  })

  // Zapisz nowy token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires
    }
  })

  try {
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Budzet Domowy <onboarding@resend.dev>",
        to: email,
        subject: "Kod resetowania hasła",
        html: `<p>Twój kod do zresetowania hasła to: <strong>${code}</strong></p><p>Kod jest ważny przez 1 godzinę.</p>`
      })
    } else {
      console.log(`Symulacja wysyłki email do ${email}. Kod: ${code}`)
    }
    return { success: true }
  } catch (error) {
    console.error("Błąd wysyłki email:", error)
    return { error: "Nie udało się wysłać wiadomości email" }
  }
}

export async function verifyAndResetPassword(email: string, code: string, newPassword: string) {
  if (!email || !code || !newPassword) return { error: "Wszystkie pola są wymagane" }

  if (newPassword.length < 8) return { error: "Hasło musi mieć co najmniej 8 znaków" }

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
      token: code
    }
  })

  if (!tokenRecord) {
    return { error: "Nieprawidłowy kod" }
  }

  if (new Date() > tokenRecord.expires) {
    await prisma.verificationToken.delete({
      where: { token: code }
    })
    return { error: "Kod wygasł" }
  }

  // Hashuj nowe hasło
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  // Aktualizuj hasło użytkownika
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })

  // Usuń token
  await prisma.verificationToken.delete({
    where: { token: code }
  })

  return { success: true }
}
