import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSavingGoal, addMoneyToGoal, deleteSavingGoal } from "@/app/actions/savingGoals"
import Link from "next/link"

// Wykorzystujemy globalny klient prisma

export default async function SavingGoalsPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const goals = await prisma.savingGoal.findMany({
    where: { userId: session.user.id }
  })

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/">
            <Button variant="ghost">{"<"} Wróć</Button>
          </Link>
          <span className="font-bold text-xl ml-4 text-primary">Skarbonki i Cele</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <Card className="bg-card/40 backdrop-blur-md border-primary/20">
          <CardHeader>
            <CardTitle>Stwórz nową Skarbonkę</CardTitle>
            <CardDescription>Odkładaj środki na wymarzone rzeczy: samochód, wczasy...</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createSavingGoal} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 w-full">
                <Label htmlFor="name">Na co zbierasz?</Label>
                <Input id="name" name="name" placeholder="np. Wycieczka do Hiszpanii" required />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="targetAmount">Cel (PLN)</Label>
                <Input id="targetAmount" name="targetAmount" type="number" step="0.01" placeholder="5000" required />
              </div>
              <Button type="submit" className="w-full sm:w-auto shrink-0">Utwórz cel</Button>
            </form>
          </CardContent>
        </Card>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100).toFixed(1)
            return (
              <Card key={goal.id} className="bg-card/40 border-border/50 shadow-lg relative overflow-hidden backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex justify-between items-center">
                    {goal.name}
                    <form action={deleteSavingGoal.bind(null, goal.id)}>
                      <Button type="submit" variant="ghost" size="sm" className="text-destructive h-6 w-6 p-0 rounded-full">✕</Button>
                    </form>
                  </CardTitle>
                  <CardDescription>
                    Zebrano: <strong className="text-foreground">{goal.currentAmount.toFixed(2)} PLN</strong> z {goal.targetAmount.toFixed(2)} PLN
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden mt-2 mb-4 relative z-10 border border-border/20">
                    <div 
                      className={`h-full transition-all duration-700 ${Number(percentage) >= 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground font-medium mb-4">
                    <span>{percentage}%</span>
                    {Number(percentage) >= 100 ? <span className="text-emerald-500 font-bold">Cel Osiągnięty! 🎉</span> : null}
                  </div>
                  
                  {Number(percentage) < 100 && (
                    <form action={addMoneyToGoal} className="flex gap-2">
                      <input type="hidden" name="goalId" value={goal.id} />
                      <Input name="amount" type="number" step="0.01" placeholder="+ kwota" className="h-8 text-sm" required />
                      <Button type="submit" size="sm" className="h-8">Wpłać</Button>
                    </form>
                  )}
                </CardContent>
                {/* Ozdobne kółko w tle */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl z-0 pointer-events-none" />
              </Card>
            )
          })}
          {goals.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground p-8 border border-dashed rounded-xl">
              Brak utworzonych celów.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
