import TopBar from '@/components/TopBar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch transactions for the current month
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, category_id')
    .eq('user_id', user.id)
    .gte('date', firstDayOfMonth)
    .lte('date', lastDayOfMonth)

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)

  const incomes = transactions?.filter(t => t.type === 'income') || []
  const expenses = transactions?.filter(t => t.type === 'expense') || []

  const totalIncome = incomes.reduce((acc, t) => acc + Number(t.amount), 0)
  const totalExpense = expenses.reduce((acc, t) => acc + Number(t.amount), 0)
  const currentBalance = totalIncome - totalExpense

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto p-4 space-y-6 mt-4">
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Twój Kokpit</h1>
          <p className="text-muted-foreground">Podsumowanie bieżącego miesiąca.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/90 backdrop-blur shadow-md flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Szybkie akcje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Przejdź od razu do dodania transakcji lub szczegółowej analityki.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild variant="default" className="w-full justify-start">
                  <Link href="/transactions">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Zarządzaj transakcjami
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href="/analytics">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Zobacz analitykę
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/90 backdrop-blur shadow-md md:col-span-2">
            <CardHeader>
              <CardTitle>Monitorowanie Limitów</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(!categories || categories.length === 0) && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Brak zdefiniowanych kategorii. Aby używać limitów, przejdź do <Link href="/settings" className="text-primary hover:underline">Ustawień</Link>.
                  </p>
                )}

                {categories && categories.filter(c => c.limit_type !== 'none').length === 0 && categories.length > 0 && (
                   <p className="text-sm text-muted-foreground">
                    Posiadasz kategorie, ale nie ustawiłaś na nich limitów miesięcznych.
                   </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {categories?.filter(c => c.limit_type !== 'none').map(category => {
                    // Compute spent for this category
                    const spent = expenses.filter(t => t.category_id === category.id).reduce((acc, t) => acc + Number(t.amount), 0)
                    
                    let limitDesc = ''
                    let limitVal = 0
                    let exceeded = false
                    let ratio = 0

                    if (category.limit_type === 'amount') {
                      limitVal = Number(category.limit_amount)
                      limitDesc = `${limitVal} PLN`
                      exceeded = spent > limitVal
                      ratio = limitVal > 0 ? (spent / limitVal) * 100 : 0
                    } else if (category.limit_type === 'percentage') {
                      // Percentage of total income current month
                      limitVal = (Number(category.limit_amount) / 100) * totalIncome
                      limitDesc = `${category.limit_amount}% (ok. ${limitVal.toFixed(2)} PLN)`
                      exceeded = spent > limitVal
                      ratio = limitVal > 0 ? (spent / limitVal) * 100 : 0
                    }

                    return (
                      <div key={category.id} className="p-3 border rounded-md relative overflow-hidden bg-background/50">
                        <div className="flex justify-between text-sm mb-1 z-10 relative">
                          <span className="font-semibold flex items-center gap-2">
                            {category.color && <span className="w-2 h-2 rounded-full" style={{backgroundColor: category.color}}></span>}
                            {category.name}
                          </span>
                          <span className={exceeded ? 'text-destructive font-bold' : ''}>
                            {spent.toFixed(2)} / {limitDesc}
                          </span>
                        </div>
                        
                        {/* Progress Bar background */}
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden z-10 relative mt-2">
                           <div 
                              className={`h-full rounded-full transition-all ${exceeded ? 'bg-destructive' : 'bg-primary'}`} 
                              style={{ width: `${Math.min(ratio, 100)}%` }}
                           />
                        </div>

                        {exceeded ? (
                          <div className="text-[10px] text-destructive mt-1 flex items-center gap-1 font-medium">
                             <AlertTriangle className="h-3 w-3" /> Przekroczono limit!
                          </div>
                        ) : (
                          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                             <CheckCircle2 className="h-3 w-3 text-green-500" /> W normie
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
