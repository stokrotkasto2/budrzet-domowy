import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import TransactionForm from "@/components/TransactionForm"
import { fetchCategories } from "@/app/actions/transaction"
import TopBar from "@/components/TopBar"

export default async function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const transaction = await prisma.transaction.findUnique({
    where: { 
      id,
      userId: session.user.id
    }
  })

  if (!transaction) notFound()

  const categories = await fetchCategories(transaction.type as "INCOME" | "EXPENSE")

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar title="Edytuj transakcję" backHref="/transactions" backLabel="Historia" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <TransactionForm 
          type={transaction.type as "INCOME" | "EXPENSE"} 
          categories={categories} 
          initialData={transaction}
        />
      </main>
    </div>
  )
}
