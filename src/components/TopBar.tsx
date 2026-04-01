import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/login/actions'

export default async function TopBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let balance = 0

  if (user) {
    // Fetch user's transactions to count balance
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, type')

    if (transactions && !error) {
      balance = transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount)
      }, 0)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Dostępne środki</span>
          <span className="text-2xl font-bold text-primary dark:text-green-400">
            {balance.toFixed(2)} <span className="text-lg">PLN</span>
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-muted-foreground hidden sm:inline-block max-w-[200px] truncate">
            {user?.email}
          </span>
          <form action={logout}>
            <button type="submit" className="text-sm font-medium hover:text-destructive transition-colors">
              Wyloguj
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
