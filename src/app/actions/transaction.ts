"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Wykorzystujemy globalny klient prisma

export async function createTransaction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Musisz być zalogowany")
  }

  const type = formData.get("type") as "INCOME" | "EXPENSE"
  const amount = parseFloat(formData.get("amount") as string)
  const categoryId = formData.get("categoryId") as string
  const dateStr = formData.get("date") as string
  const note = formData.get("note") as string
  const currency = formData.get("currency") as string || "PLN"
  const debtorName = formData.get("debtorName") as string
  const location = formData.get("location") as string
  
  // Zakładamy, że portfel pobieramy w tle (pierwszy portfel usera dopóki brak multiselecta)
  let wallet = await prisma.wallet.findFirst({
    where: { userId: session.user.id }
  })

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: session.user.id,
        name: "Portfel Główny"
      }
    })
  }

  // Handle receipt (in real app we would upload it to storage e.g. AWS S3, Supabase Storage, here just simple URL string if provided)
  const receiptFile = formData.get("receipt") as File | null;
  let receiptUrl = null;
  if (receiptFile && receiptFile.size > 0) {
    // Fake upload for simplicity, real app would upload file and get string URLL
    receiptUrl = "uploaded_receipt.jpg";
  }

  const date = new Date(dateStr)

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      walletId: wallet.id,
      type,
      amount,
      categoryId,
      date,
      note,
      currency,
      debtorName,
      location,
      receiptUrl,
    }
  })

  revalidatePath("/")
  revalidatePath("/analytics")
  revalidatePath("/transactions")
  redirect("/")
}

export async function deleteTransaction(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Brak autoryzacji")

  await prisma.transaction.delete({
    where: { 
      id,
      userId: session.user.id // Security: ensure user owns the transaction
    }
  })

  revalidatePath("/")
  revalidatePath("/analytics")
  revalidatePath("/transactions")
}


export async function fetchCategories(type: "INCOME" | "EXPENSE") {
  const session = await auth()
  if (!session?.user?.id) return []

  const categories = await prisma.category.findMany({
    where: { 
      userId: session.user.id,
      type
    }
  })

  return categories
}
