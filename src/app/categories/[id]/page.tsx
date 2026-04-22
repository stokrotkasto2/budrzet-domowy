import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import TopBar from "@/components/TopBar"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteTransaction } from "@/app/actions/transaction"
import Link from "next/link"

export default async function CategoryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { 
      id,
      userId: session.user.id
    },
    include: {
      transactions: {
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!category) notFound()

  const totalSpent = category.transactions.reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
        <TopBar title={`Kategoria: ${category.name}`} backHref="/settings/categories" backLabel="Kategorie" />

        <main className="container mx-auto p-4 pt-8 space-y-6">
            <Card className="bg-primary/5 border-primary/20 shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color || "#3b82f6" }} />
                        {category.name}
                    </CardTitle>
                    <CardDescription>
                        Łącznie w tej kategorii: <span className="font-bold text-foreground">{totalSpent.toFixed(2)} PLN</span>
                    </CardDescription>
                </CardHeader>
                {category.budgetLimit && (
                    <CardContent className="pt-0">
                        <div className="text-sm">
                            Limit miesięczny: <span className="font-bold">{category.budgetLimit} {category.budgetLimitType === "PERCENTAGE" ? "%" : "PLN"}</span>
                        </div>
                    </CardContent>
                )}
            </Card>

            <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle>Historia transakcji w kategorii</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50 text-xs uppercase text-muted-foreground font-bold">
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Notatka</th>
                                    <th className="px-6 py-4 text-right">Kwota</th>
                                    <th className="px-6 py-4 text-center">Akcje</th>
                                </tr>
                            </thead>
                            <tbody>
                                {category.transactions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            Brak transakcji w tej kategorii.
                                        </td>
                                    </tr>
                                )}
                                {category.transactions.map((t) => (
                                    <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            {t.date.toLocaleDateString("pl-PL")}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">
                                            {t.note || "-"}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'INCOME' ? "text-emerald-500" : ""}`}>
                                            {t.type === 'INCOME' ? "+" : "-"}{t.amount.toFixed(2)} {t.currency}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/transactions/edit/${t.id}`}>
                                                    <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">Edytuj</Button>
                                                </Link>
                                                <form action={deleteTransaction.bind(null, t.id)}>
                                                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">Usuń</Button>
                                                </form>
                                            </div>
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
