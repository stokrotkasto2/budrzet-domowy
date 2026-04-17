import { PrismaClient } from "@prisma/client"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const prisma = new PrismaClient()

// Definicje odznak
const ALL_BADGES = [
  { id: 'first_expense', icon: '🐣', title: 'Pierwsze Kroki', desc: 'Dodano pierwszą transakcję.' },
  { id: 'rich_kid', icon: '💰', title: 'Władca Gotówki', desc: 'Suma przychodów przekroczyła 10 000 PLN.' },
  { id: 'no_fastfood', icon: '🥗', title: 'Zdrowy Portfel', desc: 'Mniej niż 3 transakcje "Fast Food" (lub brak) w historii.' },
  { id: 'saving_master', icon: '🎯', title: 'Mistrz Celów', desc: 'Stworzono co najmniej 2 cele oszczędnościowe.' },
  { id: 'organized', icon: '📅', title: 'Zorganizowany', desc: 'Dodano co najmniej 3 subskrypcje stałe.' },
  { id: 'collector', icon: '🤝', title: 'Windykator', desc: 'Użyto modułu "kto mi wisi" (obecność dłużników w historii).' },
]

export default async function AchievementsPage() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const userId = session.user.id

  // Zbieranie danych
  const txs = await prisma.transaction.findMany({ where: { userId }, include: { category: true } })
  const goals = await prisma.savingGoal.findMany({ where: { userId } })
  const subs = await prisma.subscription.findMany({ where: { userId } })

  const earnedBadges = new Set<string>()

  // 1. First expense
  if (txs.length > 0) earnedBadges.add('first_expense')
  
  // 2. Rich kid
  const totalIn = txs.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0)
  if (totalIn > 10000) earnedBadges.add('rich_kid')

  // 3. No fast food (or very little)
  // Check if categories have names like fast food or jedzenie na miescie
  const badFoodTxs = txs.filter(t => t.category?.name.toLowerCase().includes('fast') || t.category?.name.toLowerCase().includes('mcdonald'))
  if (badFoodTxs.length < 3 && txs.length > 5) earnedBadges.add('no_fastfood') // musi byc troche transakcji ogolnie by dostac nagrode
  
  // 4. Mistrz Celów
  if (goals.length >= 2) earnedBadges.add('saving_master')

  // 5. Zorganizowany
  if (subs.length >= 3) earnedBadges.add('organized')

  // 6. Collector
  if (txs.some(t => t.debtorName !== null && t.debtorName.length > 2)) earnedBadges.add('collector')

  return (
    <div className="flex min-h-screen flex-col bg-background/95">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/">
            <Button variant="ghost">{"<"} Wróć</Button>
          </Link>
          <span className="font-bold text-xl ml-4 text-primary">Grywalizacja i Odznaki</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Twoja Gablota</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gromadź punkty dumy za mądre zarządzanie pieniędzmi. Zobacz, które tytuły finansowego ninja udało Ci się już odblokować!
          </p>
          <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full">
            <span className="text-2xl font-bold">{earnedBadges.size}</span>
            <span className="text-muted-foreground ml-2">/ {ALL_BADGES.length} Odznak</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ALL_BADGES.map(badge => {
            const isEarned = earnedBadges.has(badge.id)
            return (
              <Card key={badge.id} className={`transition-all duration-500 overflow-hidden ${isEarned ? 'bg-card/90 shadow-xl border-primary/40 scale-100' : 'bg-muted/30 border-dashed opacity-60 scale-[0.98] blur-[0.5px] hover:blur-none'}`}>
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto text-5xl mb-4 ${isEarned ? 'drop-shadow-lg scale-110' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <CardTitle className={`text-lg ${isEarned ? 'text-primary' : ''}`}>{badge.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                  {badge.desc}
                  {!isEarned && (
                    <div className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground/50 border-t border-border/50 pt-2">
                      Zablokowane
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

      </main>
    </div>
  )
}
