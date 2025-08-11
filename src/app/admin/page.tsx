import AdminWrapper from './AdminWrapper'
import AdminAuth from '@/components/admin/AdminAuth'
import { createClient } from '@/lib/supabase/server'
import { type User } from '@supabase/supabase-js'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user }} = await supabase.auth.getUser()
  if (!user) {
    return <AdminAuth />
  }

  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, name, email, role')
    .eq('id', user.id)
    .single()
  if (!admin || error) {
    return <AdminAuth />
  }
  
  return <AdminWrapper admin={user} />
}