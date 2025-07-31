'use server'
import { createClient } from '@/lib/supabase/server';

export async function login(formData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError) {
    return { error: 'Invalid email or password' }
  }

  // Get logged-in user
  const {data: { user },error: userError,} = await supabase.auth.getUser()
  if (!user || userError) {
    return { error: 'Could not fetch user after login' }
  }

  // Check if user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()
  if (!adminData || adminError) {
    return { error: 'You are not authorized as an admin' }
  }
}