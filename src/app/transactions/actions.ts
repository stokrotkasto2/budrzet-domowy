'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const { data, error } = await supabase
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
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    throw new Error('Could not fetch transactions')
  }

  return data
}

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as 'income' | 'expense'
  const category_id = formData.get('category_id') as string | null
  const description = formData.get('description') as string
  const date = formData.get('date') as string

  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount,
      type,
      category_id: category_id || null,
      description,
      date
    })

  if (error) {
    console.error('Error creating transaction:', error)
    return { error: 'Failed to create transaction' }
  }

  revalidatePath('/transactions')
  return { success: true }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    return { error: 'Failed to delete transaction' }
  }

  revalidatePath('/transactions')
  return { success: true }
}

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not found')
  }

  const amount = parseFloat(formData.get('amount') as string)
  const type = formData.get('type') as 'income' | 'expense'
  const category_id = formData.get('category_id') as string | null
  const description = formData.get('description') as string
  const date = formData.get('date') as string

  const { error } = await supabase
    .from('transactions')
    .update({
      amount,
      type,
      category_id: category_id || null,
      description,
      date
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating transaction:', error)
    return { error: 'Failed to update transaction' }
  }

  revalidatePath('/transactions')
  return { success: true }
}
