import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSubscription, deleteSubscription } from "@/app/actions/subscriptions"
import Link from "next/link"

// Wykorzystujemy globalny klient prisma

export default async function SubscriptionsPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.user.id },
    orderBy: { dayOfMonth: "asc" }
  })

  // Znajdzmy dzisiejszy dzien by wiedziec czy nadchodzi
  const dzisiaj = new Date().getDate()

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/">
            <Button variant="ghost">{"<"} Wróć</Button>
          </Link>
          <span className="font-bold text-xl ml-4 text-primary">Subskrypcje i Rachunki</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          <Card className="bg-card/40 border-border/50 shadow-md lg:col-span-1 sticky top-24 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Nowa Płatność</CardTitle>
              <CardDescription>Dodaj Netflix, Spotify czy prąd</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createSubscription} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa Płatności</Label>
                  <Input id="name" name="name" placeholder="np. Netflix" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Kwota (PLN)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayOfMonth">Dzień pobrania</Label>
                  <Input id="dayOfMonth" name="dayOfMonth" type="number" min="1" max="31" placeholder="np. 15" required />
                </div>
                <Button type="submit" className="w-full">Dodaj płatność cykliczną</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden lg:col-span-2">
            <CardHeader>
              <CardTitle>Harmonogram</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="text-muted-foreground text-center p-6">Brak zapisanych opłat cyklicznych.</p>
              ) : (
                <ul className="space-y-3">
                  {subscriptions.map(s => {
                    let dniZostalo = s.dayOfMonth - dzisiaj
                    if (dniZostalo < 0) {
                       // juz minelo w tym miesiacu
                       dniZostalo = -1 // flaga ze zaplacone lub minelo
                    }

                    const isDueSoon = dniZostalo >= 0 && dniZostalo <= 3;

                    return (
                      <li key={s.id} className={`flex items-center justify-between p-4 rounded-xl border ${isDueSoon ? 'border-destructive/30 bg-destructive/5' : 'border-border/50 bg-background/50'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-card border shadow-sm ${isDueSoon ? 'border-destructive/40 text-destructive' : 'border-border'}`}>
                            <span className="text-xl font-bold">{s.dayOfMonth}</span>
                            <span className="text-[10px] uppercase text-muted-foreground">Dzień</span>
                          </div>
                          <div>
                            <p className="font-semibold">{s.name}</p>
                            {dniZostalo === -1 ? (
                              <p className="text-xs text-muted-foreground">Prawdopodobnie opłacono</p>
                            ) : dniZostalo === 0 ? (
                              <p className="text-xs text-destructive font-bold animate-pulse">Płatność DZISIAJ!</p>
                            ) : (
                               <p className={`text-xs ${isDueSoon ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                Zostało dni: {dniZostalo}
                               </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-lg">{s.amount.toFixed(2)} PLN</span>
                          <form action={deleteSubscription.bind(null, s.id)}>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">Usuń</Button>
                          </form>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
