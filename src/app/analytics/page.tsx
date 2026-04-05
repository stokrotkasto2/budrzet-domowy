import { getAnalyticsData } from './actions'
import { MonthlyChart } from '@/components/analytics/monthly-chart'
import { CategoryChart } from '@/components/analytics/category-chart'
import TopBar from '@/components/TopBar'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const { monthlyChartData, categoryChartData } = await getAnalyticsData()

  // Simple statistics
  const totalIncome = monthlyChartData.reduce((acc, data) => acc + data.income, 0)
  const totalExpense = monthlyChartData.reduce((acc, data) => acc + data.expense, 0)
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 container mx-auto p-4 space-y-6 mt-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analityka</h1>
          <p className="text-muted-foreground">Podsumowanie Twoich finansów w ujęciu czasowym i kategorialnym.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col gap-1">
              <h3 className="tracking-tight text-sm font-medium">Całkowity Przychód</h3>
              <p className="text-2xl font-bold text-green-500">+{totalIncome.toFixed(2)} PLN</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col gap-1">
              <h3 className="tracking-tight text-sm font-medium">Całkowite Wydatki</h3>
              <p className="text-2xl font-bold text-red-500">-{totalExpense.toFixed(2)} PLN</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6 flex flex-col gap-1">
              <h3 className="tracking-tight text-sm font-medium">Bilans Całkowity</h3>
              <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-primary' : 'text-red-500'}`}>
                {(totalIncome - totalExpense).toFixed(2)} PLN
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
          <div className="lg:col-span-5">
            <MonthlyChart data={monthlyChartData} />
          </div>
          <div className="lg:col-span-3">
            <CategoryChart data={categoryChartData} />
          </div>
        </div>
      </main>
    </div>
  )
}
