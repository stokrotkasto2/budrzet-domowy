import { createClient } from '@/utils/supabase/server'
import { logout } from '@/app/login/actions'
import Link from 'next/link'

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
        <div className="flex gap-6 items-center">
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Kokpit</Link>
            <Link href="/transactions" className="hover:text-primary transition-colors">Transakcje</Link>
            <Link href="/analytics" className="hover:text-primary transition-colors">Analityka</Link>
            <Link href="/settings" className="hover:text-primary transition-colors">Ustawienia</Link>
          </nav>
          <span className="text-sm text-muted-foreground hidden sm:inline-block max-w-[200px] truncate border-l border-border pl-4">
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
