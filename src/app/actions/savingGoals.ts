"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

// Wykorzystujemy globalny klient prisma

export async function createSavingGoal(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Brak autoryzacji")

  const name = formData.get("name") as string
  const targetAmount = parseFloat(formData.get("targetAmount") as string)

  if (!name || isNaN(targetAmount)) throw new Error("Pola są wymagane")

  await prisma.savingGoal.create({
    data: {
      userId: session.user.id,
      name,
      targetAmount,
    }
  })

  revalidatePath("/saving-goals")
}

export async function addMoneyToGoal(goalId: string, amount: number) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Brak autoryzacji")

  const goal = await prisma.savingGoal.findUnique({ where: { id: goalId } })
  if (!goal || goal.userId !== session.user.id) throw new Error("Brak dostępu")

  await prisma.savingGoal.update({
    where: { id: goalId },
    data: { currentAmount: goal.currentAmount + amount }
  })

  revalidatePath("/saving-goals")
}

export async function deleteSavingGoal(goalId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Brak autoryzacji")

  await prisma.savingGoal.delete({
    where: { id: goalId, userId: session.user.id }
  })

  revalidatePath("/saving-goals")
}
