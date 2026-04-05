'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { deleteTransaction } from '@/app/transactions/actions'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Edit2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TransactionForm } from './transaction-form'

type Category = {
  id: string
  name: string
  color: string | null
}

type Transaction = {
  id: string
  amount: number
  type: string
  description: string
  date: string
  category_id?: string | null
  categories?: {
    id: string
    name: string
    color: string | null
  } | null
}

interface TransactionsTableProps {
  transactions: Transaction[]
  categories: Category[]
}

export function TransactionsTable({ transactions, categories }: TransactionsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Czy na pewno chcesz usunąć tę transakcję?')) return

    setIsDeleting(id)
    const { error } = await deleteTransaction(id)
    setIsDeleting(null)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Usunięto transakcję.')
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg bg-card/50">
        Brak dodanych transakcji.
      </div>
    )
  }

  return (
    <div className="rounded-md border bg-card text-card-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Opis</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead className="text-right">Kwota</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{new Date(transaction.date).toLocaleDateString('pl-PL')}</TableCell>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell>
                {transaction.categories ? (
                  <div className="flex items-center gap-2">
                    {transaction.categories.color && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: transaction.categories.color }}
                      />
                    )}
                    {transaction.categories.name}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">Brak kategorii</span>
                )}
              </TableCell>
              <TableCell className={`text-right font-bold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toFixed(2)} PLN
              </TableCell>
              <TableCell className="flex justify-end gap-2">
                <Dialog open={editingId === transaction.id} onOpenChange={(open) => !open && setEditingId(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => setEditingId(transaction.id)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edytuj transakcję</DialogTitle>
                      <DialogDescription>
                        Wprowadź zmiany do transakcji.
                      </DialogDescription>
                    </DialogHeader>
                    {/* The open check ensures initialData is loaded properly */}
                    {editingId === transaction.id && (
                      <TransactionForm
                        categories={categories}
                        initialData={{
                          ...transaction,
                          category_id: transaction.categories?.id || null
                        }}
                        onSuccess={() => setEditingId(null)}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(transaction.id)}
                  disabled={isDeleting === transaction.id}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
