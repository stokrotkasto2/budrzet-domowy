import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function ReportPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")
  const userId = session.user.id

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const monthTxs = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lte: end } },
    include: { category: true },
    orderBy: { date: 'asc' }
  })

  let income = 0;
  let expense = 0;

  type CatStat = { name: string, amount: number, limit: number | null, isPercent: boolean }
  const catMap: Record<string, CatStat> = {}

  monthTxs.forEach(t => {
    if (t.type === 'INCOME') income += t.amount
    else {
      expense += t.amount
      const cName = t.category?.name || "Inne"
      if (!catMap[cName]) {
        catMap[cName] = { 
          name: cName, 
          amount: 0, 
          limit: t.category?.budgetLimit || null, 
          isPercent: t.category?.budgetLimitType === 'PERCENTAGE' 
        }
      }
      catMap[cName].amount += t.amount
    }
  })

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans">
      
      {/* Pasek narzedzi no-print */}
      <div className="print:hidden flex justify-between items-center mb-8 border-b pb-4">
        <Link href="/">
          <Button variant="outline">Wróć</Button>
        </Link>
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground text-sm">Wciśnij CTRL+P lub przycisk, aby wyeksportować do PDF.</p>
          <Button onClick={() => { /* Client component wrapper would be better, but we do classic script */ }} className="bg-primary text-primary-foreground">
            <label htmlFor="druk" className="cursor-pointer" onClick={(e) => { e.preventDefault(); if (typeof window !== 'undefined') window.print(); }}>
               Drukuj / Zapisz PDF
            </label>
          </Button>
        </div>
      </div>

      {/* Kontent Raportu */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b-2 border-black pb-4">
          <div>
            <h1 className="text-4xl font-bold uppercase tracking-widest">Raport Finansowy</h1>
            <p className="text-xl mt-2 text-gray-600">Rozliczenie za: {start.toLocaleString('pl-PL', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{session.user.name || session.user.email}</p>
            <p className="text-sm text-gray-500">Wygenerowano: {now.toLocaleDateString('pl-PL')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <h3 className="text-gray-500 text-lg uppercase tracking-wider mb-2">Przychody</h3>
            <p className="text-3xl font-bold text-green-700">+{income.toFixed(2)} PLN</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <h3 className="text-gray-500 text-lg uppercase tracking-wider mb-2">Wydatki</h3>
            <p className="text-3xl font-bold text-red-700">-{expense.toFixed(2)} PLN</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-4">Wydatki wg Kategorii</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border border-gray-300">Kategoria</th>
                <th className="p-3 border border-gray-300">Wydano (PLN)</th>
                <th className="p-3 border border-gray-300">Udział %</th>
                <th className="p-3 border border-gray-300">Status Limitu</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(catMap).sort((a,b) => b.amount - a.amount).map(c => {
                const perc = expense > 0 ? ((c.amount / expense) * 100).toFixed(1) : 0
                
                let limitStatus = "-"
                if (c.limit) {
                   const trueLimit = c.isPercent ? (c.limit/100)*income : c.limit
                   limitStatus = `${c.amount.toFixed(0)} / ${trueLimit.toFixed(0)} PLN`
                }
                
                return (
                  <tr key={c.name} className="even:bg-gray-50">
                    <td className="p-3 border border-gray-300 font-medium">{c.name}</td>
                    <td className="p-3 border border-gray-300">{c.amount.toFixed(2)}</td>
                    <td className="p-3 border border-gray-300">{perc}%</td>
                    <td className="p-3 border border-gray-300 text-sm text-gray-600">{limitStatus}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-2xl font-bold border-b border-gray-300 pb-2 mb-4">Rejestr Transakcji</h2>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-gray-600 border-b-2 border-gray-400">
                <th className="py-2">Data</th>
                <th className="py-2">Notatka / Opis</th>
                <th className="py-2">Typ</th>
                <th className="py-2 text-right">Kwota</th>
              </tr>
            </thead>
            <tbody>
              {monthTxs.slice(0, 30).map(t => (
                <tr key={t.id} className="border-b border-gray-200">
                  <td className="py-2 text-gray-600">{t.date.toLocaleDateString('pl-PL')}</td>
                  <td className="py-2 font-medium">{t.note || t.category?.name || "Brak nazwy"} {t.location ? `(@ ${t.location})` : ''}</td>
                  <td className="py-2 text-xs">{t.type === 'INCOME' ? 'PRZYCHÓD' : 'WYDATEK'}</td>
                  <td className={`py-2 text-right font-bold ${t.type === 'INCOME' ? 'text-green-700' : ''}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{t.amount.toFixed(2)} PLN
                  </td>
                </tr>
              ))}
              {monthTxs.length > 30 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500 italic">
                    ... (Pominięto {monthTxs.length - 30} mniejszych transakcji. By zobaczyć wszystko eksportuj CSV - nadchodzi wkrótce!)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
