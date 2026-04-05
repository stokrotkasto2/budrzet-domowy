'use server'

import { createClient } from '@/utils/supabase/server'

export async function getAnalyticsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  // Fetch all transactions to process in-memory (for simple analytics)
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        id,
        name,
        color
      )
    `)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching analytics data:', error)
    throw new Error('Could not fetch analytics data')
  }

  // Monthly Aggregation Data for BarChart
  const monthlyDataMap = new Map<string, { month: string; income: number; expense: number }>()
  
  // Categorical Aggregation for PieChart (Expenses only typically)
  const categoryDataMap = new Map<string, { category: string; amount: number; fill: string }>()

  transactions.forEach((t) => {
    // Extract YYYY-MM
    const date = new Date(t.date)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    // Group Monthly
    if (!monthlyDataMap.has(month)) {
      monthlyDataMap.set(month, { month, income: 0, expense: 0 })
    }
    const currentMonth = monthlyDataMap.get(month)!
    if (t.type === 'income') {
      currentMonth.income += Number(t.amount)
    } else {
      currentMonth.expense += Number(t.amount)
    }

    // Group Categorical (only expenses)
    if (t.type === 'expense') {
      const catName = t.categories?.name || 'Inne'
      const catColor = t.categories?.color || '#8884d8'
      
      if (!categoryDataMap.has(catName)) {
        categoryDataMap.set(catName, { category: catName, amount: 0, fill: catColor })
      }
      categoryDataMap.get(catName)!.amount += Number(t.amount)
    }
  })

  // Sort monthly data chronologically
  const monthlyChartData = Array.from(monthlyDataMap.values()).sort((a, b) => a.month.localeCompare(b.month))
  const categoryChartData = Array.from(categoryDataMap.values()).sort((a, b) => b.amount - a.amount)

  return {
    monthlyChartData,
    categoryChartData
  }
}
