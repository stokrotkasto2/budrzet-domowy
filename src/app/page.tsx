import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

// Wykorzystujemy globalny klient prisma

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5
  })

  // Całkowite środki
  const allTransactions = await prisma.transaction.findMany({
    where: { userId }
  })
  const totalBalance = allTransactions.reduce((acc, t) => {
    return t.type === 'INCOME' ? acc + t.amount : acc - t.amount
  }, 0)

  // -- Subskrypcje --
  const subscriptions = await prisma.subscription.findMany({ where: { userId } })
  const totalSubAmount = subscriptions.reduce((acc, s) => acc + s.amount, 0)

  // -- Wyliczanie Ostrzeżeń Limitów (bieżący miesiąc) --
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const categories = await prisma.category.findMany({ where: { userId, type: "EXPENSE" } })
  const monthTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: currentMonthStart, lte: currentMonthEnd }
    }
  })

  // Mapowanie wydatków do kategorii
  const catsSpendings: Record<string, number> = {}
  monthTransactions.forEach(t => {
    catsSpendings[t.categoryId] = (catsSpendings[t.categoryId] || 0) + t.amount
  })

  const limitAlerts: { name: string, usage: number }[] = []

  categories.forEach(c => {
    if (c.budgetLimit) {
      const limitVal = c.budgetLimitType === "PERCENTAGE" 
          ? (c.budgetLimit / 100) * Math.max(totalBalance, 1) // bardzo uproszczone wyliczanie wartosci limitu %
          : c.budgetLimit;

      const spent = catsSpendings[c.id] || 0
      
      if (limitVal > 0 && spent / limitVal > 0.85) { // 85% uzycia!
        limitAlerts.push({ name: c.name, usage: (spent / limitVal) * 100 })
      }
    }
  })


  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌼</span>
            <span className="font-bold text-xl tracking-tight text-primary">Budżet Domowy</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">Cześć, {session.user.name || session.user.email}!</span>
            <div className="flex gap-2">
              <Link href="/settings/categories">
                <Button variant="outline" size="sm" className="bg-background/50">Ustawienia</Button>
              </Link>
              <form action={async () => { "use server"; await signOut({ redirectTo: '/login' }) }}>
                <Button variant="outline" size="sm" type="submit" className="bg-background/50 border-input text-destructive">Wyloguj</Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        
        {/* Sekcja Ostrzeżeń */}
        {limitAlerts.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 animate-in slide-in-from-top-4">
            <h3 className="text-destructive font-bold flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
              Zagrożenie Limitów Budżetu ({currentMonthStart.toLocaleString('pl-PL', { month: 'long' })})
            </h3>
            <ul className="text-sm space-y-1 text-destructive/80 font-medium">
              {limitAlerts.map(a => (
                <li key={a.name}>Kategoria <strong>{a.name}</strong> wykorzystała już {a.usage.toFixed(1)}% swojego budżetu!</li>
              ))}
            </ul>
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full lg:col-span-1 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary/80 font-medium">Łączna pula środków</CardDescription>
              <CardTitle className="text-4xl font-bold tracking-tight">{totalBalance.toFixed(2)} PLN</CardTitle>
            </CardHeader>
            <CardContent>
              {totalSubAmount > 0 && (
                <div className="text-sm text-muted-foreground mt-4 pt-4 border-t border-primary/10">
                  Zabezpieczone stałe opłaty: <strong className="text-foreground">-{totalSubAmount.toFixed(2)} PLN</strong> w miesiącu. <br/>
                  Zostaje do wydania ok. <strong className="text-emerald-500 font-bold">{(totalBalance - totalSubAmount).toFixed(2)} PLN</strong>.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-full lg:col-span-2 shadow-lg border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Narzędznia i Akcje</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Link href="/transactions/new/expense">
                <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/20 gap-2">Nowy wydatek</Button>
              </Link>
              <Link href="/transactions/new/income">
                <Button size="lg" variant="outline" className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 gap-2">Dodaj przychód</Button>
              </Link>
              
              <div className="w-full h-[1px] bg-border my-2" />
              
              <Link href="/analytics">
                <Button size="sm" variant="secondary" className="gap-2">📊 Analiza</Button>
              </Link>
              <Link href="/saving-goals">
                <Button size="sm" variant="secondary" className="gap-2">🎯 Skarbonki</Button>
              </Link>
              <Link href="/subscriptions">
                <Button size="sm" variant="secondary" className="gap-2">📅 Subskrypcje</Button>
              </Link>
              <Link href="/achievements">
                <Button size="sm" variant="secondary" className="gap-2 text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10">🏆 Odznaki</Button>
              </Link>
              <Link href="/analytics/report">
                <Button size="sm" variant="outline" className="gap-2 text-muted-foreground">📄 Eksportuj Raport</Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Ostatnie operacje</CardTitle>
              <CardDescription>Twoja najnowsza aktywność finansowa.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {transactions.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Brak transakcji. Dodaj pierwszą!</p>
                )}
                {transactions.map((t) => {
                  const isExpense = t.type === 'EXPENSE';
                  return (
                    <div key={t.id} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isExpense ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}>
                          {isExpense ? "📉" : "📈"}
                        </div>
                        <div>
                          <p className="font-semibold">{t.note || (isExpense ? "Wydatek" : "Przychód")}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.date.toLocaleDateString("pl-PL", { hour: '2-digit', minute: '2-digit' })} • {t.currency}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${isExpense ? "" : "text-emerald-500"}`}>
                        {isExpense ? "-" : "+"}{t.amount.toFixed(2)} PLN
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 text-center">
                <Link href="/transactions">
                  <Button variant="ghost" className="text-muted-foreground hover:text-primary">Zobacz pełną historię</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
        
      </main>
    </div>
  )
}
