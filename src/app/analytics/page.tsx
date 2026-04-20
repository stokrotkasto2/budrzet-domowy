import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

// Wykorzystujemy globalny klient prisma

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { category: true }
  })

  // Calculate stats
  let totalIncome = 0;
  let totalExpense = 0;
  
  const categorySpending: Record<string, number> = {};

  transactions.forEach(t => {
    if (t.type === 'INCOME') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      const catName = t.category?.name || "Inne";
      categorySpending[catName] = (categorySpending[catName] || 0) + t.amount;
    }
  });

  const maxCategorySpend = Math.max(...Object.values(categorySpending), 1);

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/">
            <Button variant="ghost">{"<"} Wróć do panelu</Button>
          </Link>
          <span className="font-bold text-xl ml-4 tracking-tight text-primary">Analityka</span>
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

        <Card className="bg-card/40 backdrop-blur-md border-border/50">
          <CardHeader>
            <CardTitle>Struktura wydatków wg Kategorii</CardTitle>
            <CardDescription>Zobacz, na co wydajesz najwięcej środków.</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(categorySpending).length === 0 ? (
              <p className="text-muted-foreground text-center">Brak danych o wydatkach.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categorySpending).sort(([,a], [,b]) => b - a).map(([catName, amount]) => {
                  const percentage = ((amount / maxCategorySpend) * 100).toFixed(0);
                  const totalPercent = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{catName}</span>
                        <span>{amount.toFixed(2)} PLN ({totalPercent}%)</span>
                      </div>
                      <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  )
}
