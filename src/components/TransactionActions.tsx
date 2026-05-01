"use client"

import { Button } from "@/components/ui/button"
import { deleteTransaction } from "@/app/actions/transaction"
import Link from "next/link"
import { Pencil, Trash2, Eye } from "lucide-react"

export default function TransactionActions({ id }: { id: string }) {
  const handleSubmit = (e: React.FormEvent) => {
    if (!confirm("Czy na pewno chcesz usunąć tę transakcję?")) {
      e.preventDefault()
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Link href={`/transactions/${id}`}>
        <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
          <Eye size={16} />
          <span className="hidden sm:inline ml-1">Szczegóły</span>
        </Button>
      </Link>
      
      <Link href={`/transactions/edit/${id}`}>
        <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
          <Pencil size={16} />
          <span className="hidden sm:inline ml-1">Edytuj</span>
        </Button>
      </Link>

      <form action={deleteTransaction.bind(null, id)} onSubmit={handleSubmit}>
        <Button type="submit" size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">
          <Trash2 size={16} />
          <span className="hidden sm:inline ml-1">Usuń</span>
        </Button>
      </form>
    </div>
  )
}
