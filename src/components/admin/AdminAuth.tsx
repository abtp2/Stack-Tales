'use client'
import { LuLogIn, LuLoaderCircle } from 'react-icons/lu'
import Logo from '@/components/layout/Logo'
import Styles from '@/app/admin/admin.module.css'
import { useState } from 'react'
import { login } from '@/app/admin/login-action'

export default function AdminAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    // On success, redirect to admin page so server loads session cookies
    if (result?.success) {
      window.location.assign(result.redirectPath || '/admin')
      return
    }
    setLoading(false)
  }

  return (
    <div className={Styles.adminAuth}>
      <Logo />
      <form onSubmit={handleSubmit}>
        <p>Email</p>
        <input id="email" name="email" type="email" placeholder="Enter email..." required />
        <p>Password</p>
        <input id="password" name="password" type="password" placeholder="Enter password..." required />
        {error && <div className={Styles.error}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? (
            <><LuLoaderCircle className="LoaderSpin" /> Logging in...</>
          ) : (
            <>Login <LuLogIn /></>
          )}
        </button>
      </form>
    </div>
  )
}