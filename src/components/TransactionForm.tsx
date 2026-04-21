"use client"

import { useState, useEffect } from "react"
import { createTransaction } from "@/app/actions/transaction"
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
      const result = await Tesseract.recognize(file, 'pol');
      const text = result.data.text.toUpperCase();
      console.log("Zeskanowany tekst:", text); // Debugowanie
      
      // Rozszerzony regex dla kwot (szuka najwiekszej liczby obok slow kluczowych)
      const keywords = ["SUMA", "RAZEM", "PLN", "ZŁ", "TOTAL", "ZAPŁATY", "KWOTA"];
      let foundAmount : number | null = null;

      // Szukamy linii zawierajacych slowa kluczowe
      const lines = text.split('\n');
      for (const line of lines) {
        if (keywords.some(k => line.includes(k))) {
          const amountMatch = line.match(/(\d+[.,]\d{2})/);
          if (amountMatch) {
            foundAmount = parseFloat(amountMatch[1].replace(',', '.'));
            break;
          }
        }
      }

      if (foundAmount) {
        setAmountInput(foundAmount.toFixed(2));
      } else {
        // Fallback: znajdz najwieksza liczbe zmiennoprzecinkowa w calym tekscie
        const allNums = text.match(/\d+[.,]\d{2}/g);
        if (allNums) {
           const max = Math.max(...allNums.map(n => parseFloat(n.replace(',','.'))));
           if (!isNaN(max) && max > 0) setAmountInput(max.toFixed(2));
        }
      }

      // Proba wyciagniecia daty (rozne formaty)
      const dateRegex = /(\d{2}[.-]\d{2}[.-]\d{4}|\d{4}[.-]\d{2}[.-]\d{2})/;
      const matchDate = text.match(dateRegex);
      if (matchDate) {
        let dateStr = matchDate[1].replace(/\./g, '-');
        // Jesli format to DD-MM-YYYY, zamien na YYYY-MM-DD
        if (dateStr.split('-')[0].length === 2) {
          const parts = dateStr.split('-');
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        setDateInput(dateStr + "T12:00");
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
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Wystąpił błąd.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto bg-card/60 backdrop-blur-xl border-border/40 shadow-2xl mt-4 sm:mt-8 overflow-hidden rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {type === "INCOME" ? "Dodaj Przychód" : "Nowy Wydatek"}
        </CardTitle>
        <CardDescription>Uzupełnij dane lub pozwól AI zeskanować Twój paragon.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sekcja skanowania na samej górze dla wydatków */}
        {type === "EXPENSE" && (
          <div className="relative group overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 transition-all hover:bg-primary/10">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-primary/20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
              </div>
              <div className="space-y-1">
                <Label htmlFor="receipt" className="text-base font-bold text-primary cursor-pointer hover:underline underline-offset-4">
                  ZESKANUJ PARAGON (AUTO)
                </Label>
                <p className="text-xs text-muted-foreground">AI przepisze kwotę i datę za Ciebie</p>
              </div>
            </div>
            <Input 
              id="receipt" 
              name="receipt" 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleReceiptChange} 
              className="absolute inset-0 opacity-0 cursor-pointer h-full" 
            />
            {ocrLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-bold text-primary animate-pulse">Analizuję rachunek...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="font-semibold px-1">Kwota</Label>
              <div className="relative">
                <Input 
                  id="amount" 
                  name="amount" 
                  type="number" 
                  step="0.01" 
                  required 
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="0.00"
                  className="pl-8 text-lg font-bold bg-background/50 h-12 rounded-xl"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  {currency === "PLN" ? "zł" : "$"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="font-semibold px-1">Waluta</Label>
              <select 
                name="currency" 
                id="currency" 
                className="flex h-12 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm font-medium ring-offset-background" 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="PLN">PLN - Złoty</option>
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - Dolar</option>
                <option value="GBP">GBP - Funt</option>
              </select>
            </div>
          </div>
          
          {exchangeRate && (
            <div className="bg-muted/30 p-2 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">
                ≃ <span className="text-foreground font-bold">{calculatePln()} PLN</span> (kurs {exchangeRate})
              </p>
            </div>
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
            <Label htmlFor="date" className="font-semibold px-1">Data i godzina</Label>
            <Input 
              id="date" 
              name="date" 
              type="datetime-local" 
              required 
              value={dateInput} 
              onChange={e => setDateInput(e.target.value)} 
              className="h-12 rounded-xl bg-background/50"
            />
          </div>

          <div className="space-y-2 p-4 bg-muted/20 rounded-2xl border border-border/20">
             <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2 block">Szczegóły (Opcjonalne)</Label>
             <div className="space-y-3">
                <Input id="note" name="note" placeholder="Notatka (np. Zakupy na tydzień)" className="bg-transparent border-0 border-b border-border rounded-none h-9 px-1 focus-visible:ring-0 focus-visible:border-primary transition-all" />
                <Input id="location" name="location" placeholder="Sklep / Miejsce" className="bg-transparent border-0 border-b border-border rounded-none h-9 px-1 focus-visible:ring-0 focus-visible:border-primary transition-all" />
                <Input id="debtorName" name="debtorName" placeholder={type === "INCOME" ? "Od kogo otrzymałem?" : "Komu pożyczam / Wiszę"} className="bg-transparent border-0 border-b border-border rounded-none h-9 px-1 focus-visible:ring-0 focus-visible:border-primary transition-all" />
             </div>
          </div>

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
            </Button>
          </div>
          
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground" 
            onClick={() => router.back()}
          >
            Anuluj i wróć
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
