'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminPanel from '@/components/admin/AdminPanel'
import AdminAuth from '@/components/admin/AdminAuth'
import { type User } from '@supabase/supabase-js'


export default function AdminPanelWrapper({ admin }: { admin: User }) {
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(admin)
  useEffect(() => {
    const supabase = createClient()
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setCurrentAdmin(null)
      } else {
        setCurrentAdmin(session?.user)
      }
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  if (!currentAdmin) return <AdminAuth setAdmin={setCurrentAdmin}/>
  return <AdminPanel admin={currentAdmin} setAdmin={setCurrentAdmin} />
}