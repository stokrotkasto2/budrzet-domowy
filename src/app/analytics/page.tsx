import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AnalysisChart from "@/components/AnalysisChart"

export default async function AnalysisPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const { period = 'all' } = await searchParams;

  let startDate: Date | undefined;
  const now = new Date();
  
  if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else if (period === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'week') {
    startDate = new Date(now);
    const day = startDate.getDay() || 7; 
    if (day !== 1) startDate.setHours(-24 * (day - 1));
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'day') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = { userId: session.user.id };
  if (startDate) {
    whereClause.date = { gte: startDate };
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: { category: true }
  })

  // Calculate stats
  let totalIncome = 0;
  let totalExpense = 0;
  
  const categorySpending: Record<string, { value: number, color: string }> = {};
  const categoryIncome: Record<string, { value: number, color: string }> = {};

  transactions.forEach(t => {
    const amount = t.amount;
    const catName = t.category?.name || "Inne";
    const catColor = t.category?.color || "#3b82f6";

    if (t.type === 'INCOME') {
      totalIncome += amount;
      if (!categoryIncome[catName]) {
        categoryIncome[catName] = { value: 0, color: catColor };
      }
      categoryIncome[catName].value += amount;
    } else {
      totalExpense += amount;
      if (!categorySpending[catName]) {
        categorySpending[catName] = { value: 0, color: catColor };
      }
      categorySpending[catName].value += amount;
    }
  });

  const summaryData = [
    { name: "Przychody", value: totalIncome, color: "#10b981" },
    { name: "Wydatki", value: totalExpense, color: "#ef4444" }
  ].filter(d => d.value > 0);

  const expenseData = Object.entries(categorySpending).map(([name, data]) => ({
    name,
    value: data.value,
    color: data.color
  })).sort((a, b) => b.value - a.value);

  const incomeData = Object.entries(categoryIncome).map(([name, data]) => ({
    name,
    value: data.value,
    color: data.color
  })).sort((a, b) => b.value - a.value);

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4 justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost">{"<"} Wróć do panelu</Button>
            </Link>
            <span className="font-bold text-xl ml-4 tracking-tight text-primary">Analiza</span>
          </div>
          <Link href="/transactions/new/expense">
            <Button size="sm">+ Dodaj wydatek</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">

        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <Link href="/analytics?period=all"><Button variant={period === 'all' ? 'default' : 'outline'} size="sm" className="rounded-full">Całościowy</Button></Link>
          <Link href="/analytics?period=year"><Button variant={period === 'year' ? 'default' : 'outline'} size="sm" className="rounded-full">Roczny</Button></Link>
          <Link href="/analytics?period=month"><Button variant={period === 'month' ? 'default' : 'outline'} size="sm" className="rounded-full">Miesięczny</Button></Link>
          <Link href="/analytics?period=week"><Button variant={period === 'week' ? 'default' : 'outline'} size="sm" className="rounded-full">Tygodniowy</Button></Link>
          <Link href="/analytics?period=day"><Button variant={period === 'day' ? 'default' : 'outline'} size="sm" className="rounded-full">Dzienny</Button></Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card/40 backdrop-blur-md border-emerald-500/20">
            <CardHeader>
              <CardTitle className="text-emerald-500">Całkowity Przychód</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalIncome.toFixed(2)} PLN</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/40 backdrop-blur-md border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Całkowite Wydatki</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{totalExpense.toFixed(2)} PLN</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Podsumowanie Ogólne</CardTitle>
              <CardDescription>Stosunek przychodów do wydatków.</CardDescription>
            </CardHeader>
            <CardContent>
              {summaryData.length > 0 ? (
                <AnalysisChart data={summaryData} title="Przychody vs Wydatki" />
              ) : (
                <p className="text-muted-foreground text-center py-20">Brak danych do wyświetlenia wykresu.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Struktura Wydatków</CardTitle>
              <CardDescription>Podział wydatków na kategorie.</CardDescription>
            </CardHeader>
            <CardContent>
              {expenseData.length > 0 ? (
                <AnalysisChart data={expenseData} title="Wydatki wg Kategorii" />
              ) : (
                <p className="text-muted-foreground text-center py-20">Brak danych o wydatkach.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 pt-8 border-t border-border/50">
          <h2 className="text-2xl font-bold tracking-tight">Szczegółowy wykaz transakcji</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wykaz Wydatków */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                📂 Wydatki wg kategorii
              </h3>
              {expenseData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak wydatków do wyświetlenia.</p>
              ) : (
                expenseData.map(cat => {
                  const catTransactions = transactions.filter(t => t.type === 'EXPENSE' && (t.category?.name || "Inne") === cat.name);
                  return (
                    <Card key={cat.name} className="bg-card/30 border-l-4" style={{ borderLeftColor: cat.color }}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base font-bold">{cat.name}</CardTitle>
                          <span className="font-bold text-destructive">-{cat.value.toFixed(2)} PLN</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 pt-0">
                        <div className="space-y-2 mt-2">
                          {catTransactions.map(t => (
                            <div key={t.id} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                              <div className="flex flex-col">
                                <span className="font-medium">{t.note || "Bez nazwy"}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {t.date.toLocaleDateString("pl-PL")} {t.location ? `• ${t.location}` : ""}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="font-medium">-{t.amount.toFixed(2)}</span>
                                {(t.category?.name.toLowerCase().includes('pozyczone') || t.category?.name.toLowerCase().includes('pożyczone')) && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.isSettled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {t.isSettled ? "✅ Odzyskane" : "⏳ Czeka"}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            {/* Wykaz Przychodów */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                💰 Przychody wg kategorii
              </h3>
              {incomeData.length === 0 ? (
                <p className="text-sm text-muted-foreground">Brak przychodów do wyświetlenia.</p>
              ) : (
                incomeData.map(cat => {
                  const catTransactions = transactions.filter(t => t.type === 'INCOME' && (t.category?.name || "Inne") === cat.name);
                  return (
                    <Card key={cat.name} className="bg-card/30 border-l-4" style={{ borderLeftColor: cat.color }}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base font-bold">{cat.name}</CardTitle>
                          <span className="font-bold text-emerald-500">+{cat.value.toFixed(2)} PLN</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-3 pt-0">
                        <div className="space-y-2 mt-2">
                          {catTransactions.map(t => (
                            <div key={t.id} className="flex justify-between text-sm py-1 border-b border-border/30 last:border-0">
                              <div className="flex flex-col">
                                <span className="font-medium">{t.note || "Bez nazwy"}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {t.date.toLocaleDateString("pl-PL")}
                                </span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="font-medium">+{t.amount.toFixed(2)}</span>
                                {(t.category?.name.toLowerCase().includes('pozyczone') || t.category?.name.toLowerCase().includes('pożyczone')) && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${t.isSettled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {t.isSettled ? "✅ Spłacone" : "⏳ Dług"}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
