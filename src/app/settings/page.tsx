import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { addCategory, deleteCategory } from './actions'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  const mainCategories = categories?.filter(c => !c.parent_id) || []
  const subCategories = categories?.filter(c => c.parent_id) || []

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto p-4 space-y-6 mt-4">
        <h1 className="text-3xl font-bold tracking-tight">Ustawienia Kategorii</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/90 backdrop-blur shadow-md">
            <CardHeader>
              <CardTitle>Dodaj nową kategorię</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa kategorii</Label>
                  <Input id="name" name="name" required placeholder="np. Jedzenie, Rozrywka..." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parent_id">Kategoria nadrzędna (dla podkategorii)</Label>
                  <Select name="parent_id" defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię nadrzędną..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Brak (Kategoria Główna)</SelectItem>
                      {mainCategories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit_type">Limit budżetowy na miesiąc</Label>
                  <Select name="limit_type" defaultValue="none">
                    <SelectTrigger>
                      <SelectValue placeholder="Rodzaj limitu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Bez limitu</SelectItem>
                      <SelectItem value="amount">Konkretna kwota (PLN)</SelectItem>
                      <SelectItem value="percentage">Procent puli środków (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit_amount">Wartość limitu</Label>
                  <Input id="limit_amount" name="limit_amount" type="number" step="0.01" min="0" placeholder="0" />
                </div>

                <Button type="submit" className="w-full">Dodaj</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur shadow-md">
            <CardHeader>
              <CardTitle>Twoje Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mainCategories.length === 0 && (
                   <p className="text-muted-foreground text-sm">Nie masz jeszcze żadnych kategorii. Dodaj pierwszą z panelu obok.</p>
                )}
                {mainCategories.map(mainCat => (
                  <div key={mainCat.id} className="space-y-2 border-b border-border/50 pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{mainCat.name}</p>
                        {mainCat.limit_type !== 'none' && (
                          <p className="text-xs text-muted-foreground">
                            Limit: {mainCat.limit_amount} {mainCat.limit_type === 'percentage' ? '%' : 'PLN'}
                          </p>
                        )}
                      </div>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={mainCat.id} />
                        <Button type="submit" variant="destructive" size="sm">Usuń</Button>
                      </form>
                    </div>
                    {/* Render subcategories */}
                    <div className="pl-6 space-y-2 mt-2">
                      {subCategories.filter(sc => sc.parent_id === mainCat.id).map(subCat => (
                         <div key={subCat.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">↳ {subCat.name}</p>
                               {subCat.limit_type !== 'none' && (
                                <p className="text-xs text-muted-foreground pl-4">
                                  Limit: {subCat.limit_amount} {subCat.limit_type === 'percentage' ? '%' : 'PLN'}
                                </p>
                              )}
                            </div>
                            <form action={deleteCategory}>
                              <input type="hidden" name="id" value={subCat.id} />
                              <Button type="submit" variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-950/20" size="sm">Usuń</Button>
                            </form>
                         </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
