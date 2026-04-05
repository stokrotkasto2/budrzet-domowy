import { getTransactions, getCategories } from './actions'
import { TransactionsTable } from '@/components/transactions/transactions-table'
import { TransactionForm } from '@/components/transactions/transaction-form'
import TopBar from '@/components/TopBar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TransactionsPage() {
  const transactions = await getTransactions()
  const categories = await getCategories()

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto p-4 space-y-6 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Transakcje</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 w-4 h-4" /> Dodaj transakcję
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nowa transakcja</DialogTitle>
                <DialogDescription>
                  Wprowadź szczegóły dotyczące przychodu lub wydatku.
                </DialogDescription>
              </DialogHeader>
              <TransactionForm categories={categories} />
            </DialogContent>
          </Dialog>
        </div>

        <TransactionsTable transactions={transactions} />
      </main>
    </div>
  )
}
