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
import { Trash2 } from 'lucide-react'

// Adjust type according to Supabase generated one or what is retrieved
type Transaction = {
  id: string
  amount: number
  type: string
  description: string
  date: string
  categories?: {
    id: string
    name: string
    color: string | null
  } | null
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

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
            <TableHead className="w-[80px]"></TableHead>
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
              <TableCell>
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
