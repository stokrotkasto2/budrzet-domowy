import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-background/95">
      {/* Topbar nawigacyjny */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Ikona stokrotki i logo */}
            <span className="text-2xl">🌼</span>
            <span className="font-bold text-xl tracking-tight text-primary">Budżet Domowy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">Cześć, Użytkowniku!</span>
            <Button variant="outline" size="sm" className="bg-background/50 border-input">Wyloguj</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 space-y-8">
        
        {/* Główna sekcja środków */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full lg:col-span-1 border-primary/20 bg-primary/5 shadow-xl shadow-primary/5">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary/80 font-medium">Łączna pula środków</CardDescription>
              <CardTitle className="text-4xl font-bold tracking-tight">14 250,00 PLN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <span className="text-emerald-500 font-medium mr-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                  +12.5%
                </span>
                względem zeszłego miesiąca
              </div>
            </CardContent>
          </Card>

          {/* Szybkie akcje */}
          <Card className="col-span-full lg:col-span-2 shadow-lg border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/20 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Nowy wydatek
              </Button>
              <Button size="lg" variant="outline" className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10 gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Dodaj przychód
              </Button>
              <Button size="lg" variant="secondary" className="gap-2">
                📷 Skanuj paragon
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Ostatnie transakcje */}
        <section>
          <Card className="shadow-lg border-border/50 bg-card/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ostatnie operacje</CardTitle>
              <CardDescription>Twoja najnowsza aktywność finansowa.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { name: "Biedronka - Zakupy domowe", date: "Dzisiaj, 14:32", amount: "-145.20 PLN", isExpense: true },
                  { name: "Wypłata - Październik", date: "Wczoraj, 08:15", amount: "+6 500.00 PLN", isExpense: false },
                  { name: "Netflix Subskrypcja", date: "12 kwi, 10:00", amount: "-43.00 PLN", isExpense: true },
                ].map((t, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${t.isExpense ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {t.isExpense ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.date}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${t.isExpense ? "" : "text-emerald-500"}`}>
                      {t.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
        
      </main>
    </div>
  )
}
