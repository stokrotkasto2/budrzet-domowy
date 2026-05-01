"use client"

import { useTransition, useState } from "react"
import { toggleTransactionSettled } from "@/app/actions/transaction"

export default function SettledCheckbox({ 
  id, 
  initialIsSettled, 
  isExpense 
}: { 
  id: string, 
  initialIsSettled: boolean,
  isExpense: boolean 
}) {
  const [isPending, startTransition] = useTransition()
  const [checked, setChecked] = useState(initialIsSettled)

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked
    setChecked(newChecked)
    startTransition(async () => {
      await toggleTransactionSettled(id, newChecked)
    })
  }

  const label = isExpense ? "Odzyskano pieniądze (ktoś mi oddał)" : "Zwrócono pieniądze (ja oddałem)"

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border border-border/50">
      <input 
        type="checkbox"
        id="settled" 
        checked={checked} 
        onChange={handleToggle} 
        disabled={isPending}
        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
      />
      <label 
        htmlFor="settled" 
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
      >
        {label}
        {isPending && <span className="ml-2 text-xs text-muted-foreground animate-pulse">(Zapisywanie...)</span>}
      </label>
    </div>
  )
}
