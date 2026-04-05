'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createTransaction, updateTransaction } from '@/app/transactions/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Category = {
  id: string
  name: string
  color: string | null
}

interface TransactionFormProps {
  categories: Category[]
  onSuccess?: () => void
  initialData?: {
    id: string
    type: string
    amount: number
    date: string
    category_id: string | null
    description: string
  }
}

export function TransactionForm({ categories, onSuccess, initialData }: TransactionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>(initialData?.type === 'income' ? 'income' : 'expense')
  const [selectedCategory, setSelectedCategory] = useState<string>(initialData?.category_id || '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedCategory) {
      toast.error('Kategoria jest wymagana. Proszę wybrać z listy.')
      return
    }

    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    formData.append('type', type)
    if (selectedCategory) {
      formData.append('category_id', selectedCategory)
    }

    const { error } = initialData
      ? await updateTransaction(initialData.id, formData)
      : await createTransaction(formData)

    setIsSubmitting(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success(initialData ? 'Transakcja zaktualizowana!' : 'Transakcja została dodana!')
      if (!initialData) {
        e.currentTarget.reset()
        setSelectedCategory('')
      }
      if (onSuccess) onSuccess()
    }
  }

  return (
    <Tabs value={type} onValueChange={(v) => setType(v as 'expense' | 'income')}>
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="expense" className="data-[state=active]:text-red-500">Wydatek</TabsTrigger>
        <TabsTrigger value="income" className="data-[state=active]:text-green-500">Przychód</TabsTrigger>
      </TabsList>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Kwota (PLN)</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" defaultValue={initialData?.amount} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" required defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategoria <span className="text-destructive">*</span></Label>
          <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v || '')} required>
            <SelectTrigger>
              <SelectValue placeholder="Wybierz kategorię (wymagane)" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  <div className="flex items-center gap-2">
                    {c.color && (
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    )}
                    {c.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Opis</Label>
          <Input id="description" name="description" required placeholder="Gdzie uciekły pieniądze?" defaultValue={initialData?.description} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Zapisywanie...' : initialData ? 'Zapisz zmiany' : 'Dodaj transakcję'}
        </Button>
      </form>
    </Tabs>
  )
}
