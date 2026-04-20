"use server"

import { TransactionType, LimitType } from "@prisma/client"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Wykorzystujemy globalny klient prisma

export async function createCategory(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Brak autoryzacji")
  }

  const name = formData.get("name") as string
  const type = formData.get("type") as TransactionType
  const budgetLimit = formData.get("budgetLimit") ? parseFloat(formData.get("budgetLimit") as string) : null
  const budgetLimitType = formData.get("budgetLimitType") as LimitType
  const color = formData.get("color") as string

  if (!name) throw new Error("Nazwa jest wymagana")

  await prisma.category.create({
    data: {
      userId: session.user.id,
      name,
      type,
      budgetLimit,
      budgetLimitType: budgetLimitType || "AMOUNT",
      color: color || "#3b82f6"
    }
  })

  revalidatePath("/settings/categories")
}

export async function deleteCategory(categoryId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Brak autoryzacji")
  }

  // Upewnijmy sie ze uzytkownik jest wlascicielem
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  })

  if (!category || category.userId !== session.user.id) {
    throw new Error("Nie masz uprawnień albo kategoria nie istnieje")
  }

  await prisma.category.delete({
    where: { id: categoryId }
  })

  revalidatePath("/settings/categories")
}
