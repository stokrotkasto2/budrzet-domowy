import TransactionForm from "@/components/TransactionForm"
import { fetchCategories } from "@/app/actions/transaction"

export default async function NewIncomePage() {
  const categories = await fetchCategories("INCOME")
  
  return (
    <div className="container mx-auto p-4 flex flex-col pt-12">
      <TransactionForm type="INCOME" categories={categories} />
    </div>
  )
}
