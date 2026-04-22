import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import TopBar from "@/components/TopBar" // I noticed TopBar exists in my list_dir earlier
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteTransaction } from "@/app/actions/transaction"
import Link from "next/link"

export default async function TransactionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    include: { category: true }
  })

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="ghost" size="sm">{"<"} Panel</Button>
                    </Link>
                    <span className="font-bold text-xl tracking-tight text-primary">Historia Transakcji</span>
                </div>
                <Link href="/transactions/new/expense">
                    <Button size="sm">Nowa transakcja</Button>
                </Link>
            </div>
        </header>

        <main className="container mx-auto p-4 pt-8">
            <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle>Wszystkie operacje ({transactions.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground font-bold">
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Kategoria</th>
                                    <th className="px-6 py-4">Notatka</th>
                                    <th className="px-6 py-4 text-right">Kwota</th>
                                    <th className="px-6 py-4 text-center">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            Brak transakcji do wyświetlenia.
                                        </td>
                                    </tr>
                                )}
                                {transactions.map((t) => (
                                    <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            {t.date.toLocaleDateString("pl-PL")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span 
                                                className="px-2 py-1 rounded-full text-[10px] font-bold text-white shadow-sm"
                                                style={{ backgroundColor: t.category?.color || "#3b82f6" }}
                                            >
                                                {t.category?.name || "Brak"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {t.note || "-"}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? "text-emerald-500" : ""}`}>
                                            {t.type === 'INCOME' ? "+" : "-"}{t.amount.toFixed(2)} {t.currency}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <form action={async () => { 
                                                "use server"
                                                await deleteTransaction(t.id) 
                                            }}>
                                                <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">Usuń</Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  )
}
