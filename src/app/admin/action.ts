'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type LoginResult = {
  success?: boolean
  error?: string
}

export async function login(formData: FormData): Promise<LoginResult & { redirectPath?: string }> {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    if (!email || !password) {
      return { error: 'Email and password are required' }
    }
    if (!email.includes('@')) {
      return { error: 'Please enter a valid email address' }
    }
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (signInError) {
      return { 
        error: signInError.message === 'Invalid login credentials' 
          ? 'Invalid email or password' 
          : 'Login failed. Please try again.' 
      }
    }
    if (!authData.user) {
      return { error: 'Login failed. No user data received.' }
    }
    revalidatePath('/admin', 'layout')
    return { 
      success: true, 
      redirectPath: '/admin' 
    }
  } catch (error) {
    console.error('Unexpected login error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}