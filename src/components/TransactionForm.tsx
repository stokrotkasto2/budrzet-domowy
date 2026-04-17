"use client"

import { useState, useEffect } from "react"
import { createTransaction } from "@/app/actions/transaction"
import { Category } from "@prisma/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function TransactionForm({ type, categories }: { type: "INCOME" | "EXPENSE", categories: Category[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState("PLN")
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [amountInput, setAmountInput] = useState("")

  useEffect(() => {
    async function fetchRate() {
      if (currency !== "PLN") {
        try {
          const res = await fetch(`https://api.nbp.pl/api/exchangerates/rates/a/${currency.toLowerCase()}/?format=json`)
          const data = await res.json()
          setExchangeRate(data.rates[0].mid)
        } catch (e) {
          console.error("Błąd pobierania kursu:", e)
        }
      } else {
        setExchangeRate(null)
      }
    }
    fetchRate()
  }, [currency])

  const calculatePln = () => {
    if (!exchangeRate || !amountInput) return null
    return (parseFloat(amountInput) * exchangeRate).toFixed(2)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      formData.append("type", type)
      await createTransaction(formData)
    } catch (err) {
      console.error(err)
      alert("Wystąpił błąd.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-card/90 backdrop-blur-sm border-border/50 shadow-xl mt-8">
      <CardHeader>
        <CardTitle>{type === "INCOME" ? "Dodaj Przychód" : "Nowy Wydatek"}</CardTitle>
        <CardDescription>Wypełnij dane, aby dodać transakcję do budżetu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Kwota</Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                required 
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Waluta</Label>
              <select name="currency" id="currency" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="PLN">PLN - Złoty</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dolar sz</option>
                <option value="GBP">GBP - Funt</option>
              </select>
            </div>
          </div>
          
          {exchangeRate && (
            <p className="text-xs text-muted-foreground mt-[-8px]">
              Kosz w {currency}: {amountInput || "0"} ~ {calculatePln() || "0"} PLN (kurs {exchangeRate})
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="categoryId">Kategoria</Label>
            <select name="categoryId" id="categoryId" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" required>
              <option value="">Wybierz kategorię...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data i godzina</Label>
            <Input id="date" name="date" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notatka</Label>
            <Input id="note" name="note" placeholder="Za co to było..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokalizacja</Label>
            <Input id="location" name="location" placeholder="np. Sklep Biedronka" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="debtorName">
               {type === "INCOME" ? "Od kogo otrzymałem? (Kto mi wisi)" : "Komu pożyczam / Wiszę"}
            </Label>
            <Input id="debtorName" name="debtorName" placeholder="Jan Kowalski..." />
          </div>

          {type === "EXPENSE" && (
            <div className="space-y-2">
              <Label htmlFor="receipt">Zdjęcie paragonu</Label>
              <Input id="receipt" name="receipt" type="file" accept="image/*" capture="environment" className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2 file:py-1 cursor-pointer" />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
              Anuluj
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz transakcję"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
