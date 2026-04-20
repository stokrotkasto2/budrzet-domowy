import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AnalysisChart from "@/components/AnalysisChart"

export default async function AnalysisPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
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
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/">
            <Button variant="ghost">{"<"} Wróć do panelu</Button>
          </Link>
          <span className="font-bold text-xl ml-4 tracking-tight text-primary">Analiza</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        
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

        {incomeData.length > 0 && (
          <Card className="bg-card/40 backdrop-blur-md border-border/50">
            <CardHeader>
              <CardTitle>Struktura Przychodów</CardTitle>
              <CardDescription>Podział przychodów na kategorie.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalysisChart data={incomeData} title="Przychody wg Kategorii" />
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  )
}
