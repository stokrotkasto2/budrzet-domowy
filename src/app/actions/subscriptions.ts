"use server"

import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function createSubscription(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Brak autoryzacji")

  const name = formData.get("name") as string
  const amount = parseFloat(formData.get("amount") as string)
  const dayOfMonth = parseInt(formData.get("dayOfMonth") as string)

  if (!name || isNaN(amount) || isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error("Dane niepoprawne")
  }

  await prisma.subscription.create({
    data: {
      userId: session.user.id,
      name,
      amount,
      dayOfMonth
    }
  })

  revalidatePath("/subscriptions")
  revalidatePath("/") // Refresh dashboard if used there
}

export async function deleteSubscription(subId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Brak autoryzacji")

  await prisma.subscription.delete({
    where: { id: subId, userId: session.user.id }
  })

  revalidatePath("/subscriptions")
  revalidatePath("/")
}
