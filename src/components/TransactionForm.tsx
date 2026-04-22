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

  const handleReceiptChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    try {
      // Wywołanie sztucznej inteligencji OCR
      const result = await Tesseract.recognize(file, 'pol');
      const text = result.data.text.toUpperCase();
      
      // Proba wyciagniecia sumy (np. SUMA, PLN, RAZEM XXX.XX)
      const amountRegex = /(?:SUMA|RAZEM|PLN).*?(\d+[.,]\d{2})/;
      const matchAmount = text.match(amountRegex);
      if (matchAmount) {
        setAmountInput(matchAmount[1].replace(',', '.'));
      } else {
        // Fallback: znajdz najwieksza liczbe zmiennoprzecinkowa
        const allNums = text.match(/\d+[.,]\d{2}/g);
        if (allNums) {
           const max = Math.max(...allNums.map(n => parseFloat(n.replace(',','.'))));
           if (!isNaN(max)) setAmountInput(max.toString());
        }
      }

      // Proba wyciagniecia daty np. YYYY-MM-DD
      const dateRegex = /(\d{4}-\d{2}-\d{2})/;
      const matchDate = text.match(dateRegex);
      if (matchDate) {
        setDateInput(matchDate[1] + "T12:00");
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

  // Stan dla dynamicznej listy kategorii
  const [localCategories, setLocalCategories] = useState(categories)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")

  const handleAddNewCategory = async () => {
    if (!newCatName) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", newCatName)
      formData.append("type", type)
      formData.append("color", "#3b82f6") // Domyslny niebieski
      
      const res = await createCategory(formData)
      if (res && res.id) {
        // Dodaj do lokalnej listy i zaznacz
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
      // Upewnij sie ze bierzemy wybrana kategorie (rowniez te nowo dodana)
      formData.set("categoryId", selectedCategoryId)
      
      await createTransaction(formData)
    } catch (err) {
      console.error(err)
      alert("Wystąpił błąd.")
    } finally {
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <Card className="w-full max-w-lg mx-auto bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl mt-4 sm:mt-8 overflow-hidden rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {type === "INCOME" ? "Dodaj Przychód" : "Nowy Wydatek"}
        </CardTitle>
        <CardDescription>Uzupełnij dane lub pozwól AI zeskanować Twój paragon.</CardDescription>
=======
    <Card className="w-full max-w-lg mx-auto bg-card/40 backdrop-blur-md border-border/50 shadow-xl mt-8">
      <CardHeader>
        <CardTitle>{type === "INCOME" ? "Dodaj Przychód" : "Nowy Wydatek"}</CardTitle>
        <CardDescription>Wypełnij dane, aby dodać transakcję do budżetu.</CardDescription>
>>>>>>> parent of fd0a23c (Poprawa OCR i przebudowa formularza transakcji (Mobile-First))
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
<<<<<<< HEAD
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
=======
            <Label htmlFor="categoryId">Kategoria</Label>
            <select name="categoryId" id="categoryId" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm" required>
>>>>>>> parent of fd0a23c (Poprawa OCR i przebudowa formularza transakcji (Mobile-First))
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

<<<<<<< HEAD
          <div className="flex gap-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
              disabled={loading || selectedCategoryId === "NEW" || !selectedCategoryId}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                  <span>Zapisywanie...</span>
                </div>
              ) : (
                "DODAJ TRANSAKCJĘ"
              )}
=======
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
            <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
              Anuluj
            </Button>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz transakcję"}
>>>>>>> parent of fd0a23c (Poprawa OCR i przebudowa formularza transakcji (Mobile-First))
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
