import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { signOut } from "@/auth"

const prisma = new PrismaClient()

export default async function Dashboard() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Pobierz transakcje
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 5
  })

  // Oblicz całkowite środki (bardzo uproszczone: suma przychodów - suma wydatków)
  // W prawdziwym środowisku portfel trzyma saldo lub jest ono ciągle liczone precyzyjnie.
  const allTransactions = await prisma.transaction.findMany({
    where: { userId: session.user.id }
  })

  const totalBalance = allTransactions.reduce((acc, t) => {
    return t.type === 'INCOME' ? acc + t.amount : acc - t.amount
  }, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background/95">
      {/* Topbar nawigacyjny */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🌼</span>
            <span className="font-bold text-xl tracking-tight text-primary">Budżet Domowy</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">
              Cześć, {session.user.name || session.user.email}!
            </span>
            <div className="flex gap-2">
              <Link href="/settings/categories">
                <Button variant="outline" size="sm" className="bg-background/50">Ustawienia</Button>
              </Link>
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: '/login' })
              }}>
                <Button variant="outline" size="sm" type="submit" className="bg-background/50 border-input text-destructive">Wyloguj</Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full lg:col-span-1 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary/80 font-medium">Łączna pula środków</CardDescription>
              <CardTitle className="text-4xl font-bold tracking-tight">{totalBalance.toFixed(2)} PLN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                Wlicza wszystkie dodane transakcje
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-full lg:col-span-2 shadow-lg border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Link href="/transactions/new/expense">
                <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/20 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Nowy wydatek
                </Button>
              </Link>
              <Link href="/transactions/new/income">
                <Button size="lg" variant="outline" className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Dodaj przychód
                </Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="secondary" className="gap-2">
                  📊 Analiza Finansowa
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="shadow-lg border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ostatnie operacje</CardTitle>
              <CardDescription>Twoja najnowsza aktywność finansowa (ostatnie 5 operacji).</CardDescription>
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
                          {isExpense ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                          )}
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
            </CardContent>
          </Card>
        </section>
        
      </main>
    </div>
  )
}
