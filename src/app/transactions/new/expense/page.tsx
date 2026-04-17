import TransactionForm from "@/components/TransactionForm"
import { fetchCategories } from "@/app/actions/transaction"

export default async function NewExpensePage() {
  const categories = await fetchCategories("EXPENSE")
  
  return (
    <div className="container mx-auto p-4 flex flex-col pt-12">
      <TransactionForm type="EXPENSE" categories={categories} />
    </div>
  )
}
