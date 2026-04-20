import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { createCategory, deleteCategory } from "@/app/actions/category"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Wykorzystujemy globalny klient prisma

export default async function CategoriesSettings() {
  const session = await auth()
  if (!session?.user?.id) return redirect("/login")

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id }
  })

  return (
    <div className="container mx-auto p-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Zarządzanie kategoriami</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-card/90 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Dodaj nową kategorię</CardTitle>
            <CardDescription>Ustal własne limity wydatków lub śledź przychody.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa Kategorii</Label>
                <Input id="name" name="name" required placeholder="np. Zakupy, Rozrywka..." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Typ</Label>
                <select name="type" id="type" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                  <option value="EXPENSE">Wydatek</option>
                  <option value="INCOME">Przychód</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetLimit">Limit budżetu (opcjonalny)</Label>
                <Input id="budgetLimit" name="budgetLimit" type="number" step="0.01" placeholder="np. 500" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetLimitType">Typ Limitu</Label>
                <select name="budgetLimitType" id="budgetLimitType" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                  <option value="AMOUNT">Stała Kwota (PLN)</option>
                  <option value="PERCENTAGE">Procent całej puli (%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Kolor na wykresie</Label>
                <div className="flex gap-2">
                  <Input id="color" name="color" type="color" defaultValue="#3b82f6" className="w-16 h-10 p-1" />
                  <Input type="text" value="Wybierz kolor dla tej kategorii" disabled className="flex-1 text-xs text-muted-foreground" />
                </div>
              </div>

              <Button type="submit" className="w-full">Stwórz kategorię</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card/90 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle>Twoje Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center">Brak dodanych kategorii.</p>
            ) : (
              <ul className="space-y-4">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-background/50 p-3 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: cat.color || "#3b82f6" }} />
                      <span className="font-semibold">{cat.name} </span>
                      <span className="text-xs uppercase px-2 py-1 bg-muted rounded-full ml-2">
                        {cat.type === "INCOME" ? "Przychód" : "Wydatek"}
                      </span>
                      {cat.budgetLimit && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Limit: {cat.budgetLimit} {cat.budgetLimitType === "PERCENTAGE" ? "%" : "PLN"}
                        </p>
                      )}
                    </div>
                    <form action={async () => {
                      "use server"
                      await deleteCategory(cat.id)
                    }} className="mt-2 sm:mt-0">
                      <Button variant="destructive" size="sm" type="submit">
                        Usuń
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
