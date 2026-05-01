import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import TopBar from "@/components/TopBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { deleteTransaction } from "@/app/actions/transaction"
import { Calendar, MapPin, Notebook, User, Tag, Pencil, Trash2 } from "lucide-react"
import SettledCheckbox from "@/components/SettledCheckbox"

export default async function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const transaction = await prisma.transaction.findUnique({
    where: { 
      id,
      userId: session.user.id
    },
    include: {
      category: true
    }
  })

  if (!transaction) notFound()

  const isExpense = transaction.type === "EXPENSE"

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
        <TopBar title="Szczegóły transakcji" backHref="/transactions" backLabel="Historia" />

        <main className="container mx-auto p-4 pt-8 max-w-2xl">
            <Card className="bg-card/40 backdrop-blur-md border-border/50 shadow-2xl overflow-hidden rounded-3xl">
                <div className={`h-2 w-full ${isExpense ? "bg-destructive" : "bg-emerald-500"}`} />
                <CardHeader className="text-center pb-8 pt-10">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${isExpense ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"}`}>
                        {isExpense ? "📉" : "📈"}
                    </div>
                    <CardTitle className={`text-4xl font-black tracking-tight ${isExpense ? "" : "text-emerald-500"}`}>
                        {isExpense ? "-" : "+"}{transaction.amount.toFixed(2)} {transaction.currency}
                    </CardTitle>
                    <CardDescription className="text-lg mt-1 font-medium">
                        {transaction.category?.name || "Brak kategorii"}
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6 px-8 pb-10">
                    <div className="grid gap-6">
                        <div className="flex items-center gap-4 group">
                            <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Data i godzina</p>
                                <p className="font-semibold">{transaction.date.toLocaleString("pl-PL", { dateStyle: 'full', timeStyle: 'short' })}</p>
                            </div>
                        </div>

                        {transaction.note && (
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors mt-1">
                                    <Notebook size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Notatka</p>
                                    <p className="font-medium text-lg leading-relaxed">{transaction.note}</p>
                                </div>
                            </div>
                        )}

                        {transaction.location && (
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Lokalizacja</p>
                                    <p className="font-semibold">{transaction.location}</p>
                                </div>
                            </div>
                        )}

                        {transaction.debtorName && (
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                                        {isExpense ? "Komu / Pożyczka" : "Od kogo / Dłużnik"}
                                    </p>
                                    <p className="font-semibold">{transaction.debtorName}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 group">
                            <div className="p-3 rounded-2xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                <Tag size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Typ operacji</p>
                                <p className="font-semibold">{isExpense ? "Wydatek" : "Przychód"}</p>
                            </div>
                        </div>

                        {transaction.category?.name.toLowerCase().includes("pożyczone") || transaction.category?.name.toLowerCase().includes("pozyczone") ? (
                            <div className="mt-4">
                                <SettledCheckbox 
                                    id={transaction.id} 
                                    initialIsSettled={transaction.isSettled} 
                                    isExpense={isExpense} 
                                />
                            </div>
                        ) : null}
                    </div>

                    {transaction.receiptUrl && (
                        <div className="mt-8 pt-8 border-t border-border/50">
                             <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-4">Załącznik</p>
                             <div className="bg-muted/50 rounded-2xl p-8 text-center border-2 border-dashed border-border/50">
                                <span className="text-sm text-muted-foreground">Podgląd paragonu (Symulacja)</span>
                             </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <Link href={`/transactions/edit/${transaction.id}`} className="w-full">
                            <Button className="w-full h-12 rounded-2xl gap-2 font-bold" variant="secondary">
                                <Pencil size={18} />
                                Edytuj
                            </Button>
                        </Link>
                        <form action={deleteTransaction.bind(null, transaction.id)} className="w-full">
                            <Button type="submit" className="w-full h-12 rounded-2xl gap-2 font-bold text-destructive hover:bg-destructive/10" variant="ghost">
                                <Trash2 size={18} />
                                Usuń
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </main>
    </div>
  )
}
