'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addCategory(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  const name = formData.get('name') as string
  const parent_id = formData.get('parent_id') as string | null
  const limit_type = formData.get('limit_type') as string
  const limit_amount = parseFloat(formData.get('limit_amount') as string) || 0

  const { error } = await supabase
    .from('categories')
    .insert({
      user_id: user.id,
      name,
      parent_id: parent_id === 'none' ? null : parent_id,
      limit_type,
      limit_amount
    })

  if (error) {
    console.error(error)
    throw new Error('Nie udało się dodać kategorii')
  }

  revalidatePath('/settings')
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    throw new Error('Nie udało się usunąć kategorii')
  }

  revalidatePath('/settings')
}
