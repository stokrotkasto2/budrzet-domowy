import TopBar from '@/components/TopBar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto p-4 space-y-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Twój Kokpit</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/90 backdrop-blur border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Zarządzanie transakcjami pojawi się tutaj. (Zadanie 6)
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/90 backdrop-blur border-border/50 shadow-md">
            <CardHeader>
              <CardTitle>Limity kategorii</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Brak zdefiniowanych limitów lub kategorii. (Zadanie 5)
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
