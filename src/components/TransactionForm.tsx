"use client"

import { useState, useEffect } from "react"
import { createTransaction } from "@/app/actions/transaction"
import { createCategory } from "@/app/actions/category"
import { Category } from "@prisma/client"
import { useRouter } from "next/navigation"
import Tesseract from "tesseract.js"
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
  const [dateInput, setDateInput] = useState(new Date().toISOString().slice(0, 16))
  const [ocrLoading, setOcrLoading] = useState(false)
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [localCategories, setLocalCategories] = useState(categories)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      const result = await Tesseract.recognize(file, 'pol');
      const text = result.data.text.toUpperCase();
      console.log("OCR Result:", text);
      
      // Kwota: szukamy SUMA, DO ZAPŁATY, RAZEM itp.
      const amountPatterns = [
        /(?:SUMA|RAZEM|ZAPŁATY|TOTAL|PLN).*?(\d+[.,]\d{2})/i,
        /(\d+[.,]\d{2})\s*(?:PLN|ZŁ)/i,
        /(\d+[.,]\d{2})/g // fallback - weźmiemy największą
      ];

      let foundAmount = "";
      for (const pattern of amountPatterns) {
        const match = text.match(pattern);
        if (match) {
          if (pattern.global) {
             const allNums = text.match(pattern);
             if (allNums) {
               const max = Math.max(...allNums.map(n => parseFloat(n.replace(',','.'))));
               if (!isNaN(max)) foundAmount = max.toString();
             }
          } else {
            foundAmount = match[1].replace(',', '.');
            break;
          }
        }
      }
      if (foundAmount) setAmountInput(foundAmount);

      // Data: YYYY-MM-DD, DD-MM-YYYY, DD.MM.YYYY
      const datePatterns = [
        /(\d{4}-\d{2}-\d{2})/,
        /(\d{2}-\d{2}-\d{4})/,
        /(\d{2}\.\d{2}\.\d{4})/
      ];

      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          let dateStr = match[1].replace(/\./g, '-');
          // Jeśli DD-MM-YYYY, zamień na YYYY-MM-DD
          const parts = dateStr.split('-');
          if (parts[0].length === 2) {
            dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
          setDateInput(`${dateStr}T12:00`);
          break;
        }
      }
    } catch (err) {
      console.error("Błąd skanowania paragonu:", err);
    } finally {
      setOcrLoading(false);
    }
  }

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

  const handleAddNewCategory = async () => {
    if (!newCatName) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", newCatName)
      formData.append("type", type)
      formData.append("color", "#3b82f6")
      
      const res = await createCategory(formData)
      if (res && res.id) {
        setLocalCategories([...localCategories, res])
        setSelectedCategoryId(res.id)
        setShowNewCategoryForm(false)
        setNewCatName("")
      }
    } catch (err) {
      console.error(err)
      alert("Błąd podczas dodawania kategorii")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      formData.append("type", type)
      formData.set("categoryId", selectedCategoryId)
      
      await createTransaction(formData)
      router.push("/transactions")
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Wystąpił błąd.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl mt-4 sm:mt-8 overflow-hidden rounded-3xl mb-32">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {type === "INCOME" ? "Dodaj Przychód" : "Nowy Wydatek"}
        </CardTitle>
        <CardDescription>Uzupełnij dane lub pozwól AI zeskanować Twój paragon.</CardDescription>
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
              <select 
                name="currency" 
                id="currency" 
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background" 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
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
            <Label htmlFor="categoryId" className="font-semibold px-1">Kategoria</Label>
            <select 
              name="categoryId" 
              id="categoryId" 
              className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium" 
              required
              value={selectedCategoryId}
              onChange={(e) => {
                if (e.target.value === "NEW") {
                  setShowNewCategoryForm(true)
                } else {
                  setSelectedCategoryId(e.target.value)
                  setShowNewCategoryForm(false)
                }
              }}
            >
              <option value="">Wybierz kategorię...</option>
              {localCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="NEW" className="text-primary font-bold">+ Dodaj nową kategorię...</option>
            </select>
          </div>

          {showNewCategoryForm && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="newCatName" className="text-xs font-bold text-primary uppercase">Nazwa nowej kategorii</Label>
              <div className="flex gap-2">
                <Input 
                  id="newCatName" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  placeholder="np. Kawiarnie" 
                  className="bg-background/50 rounded-xl"
                />
                <Button type="button" onClick={handleAddNewCategory} disabled={!newCatName || loading} className="rounded-xl">
                  Dodaj
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowNewCategoryForm(false)} className="rounded-xl">
                  Anuluj
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="date">Data i godzina</Label>
            <Input id="date" name="date" type="datetime-local" required value={dateInput} onChange={e => setDateInput(e.target.value)} />
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
            <div className="space-y-2 border border-primary/20 p-4 rounded-lg bg-primary/5">
              <Label htmlFor="receipt" className="text-primary font-bold">📷 Zeskanuj paragon (OCR)</Label>
              <Input id="receipt" name="receipt" type="file" accept="image/*" capture="environment" onChange={handleReceiptChange} className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-2 file:py-1 cursor-pointer bg-background" />
              {ocrLoading && <p className="text-sm text-primary animate-pulse font-medium">Skanowanie w toku... Analizuję rachunek 🔎</p>}
              <p className="text-xs text-muted-foreground mt-2">Zrób zdjęcie, a inteligentny algorytm sam przepisze kwotę i datę!</p>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-2xl h-12" 
              onClick={() => router.back()}
            >
              Anuluj
            </Button>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border/50 sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:flex-1 z-[100]">
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20" 
                disabled={loading || (selectedCategoryId === "NEW" || !selectedCategoryId)}
              >
                {loading ? "Zapisywanie..." : "Dodaj transakcję"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
