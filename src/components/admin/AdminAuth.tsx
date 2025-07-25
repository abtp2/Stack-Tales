"use client";
import { LuLogIn,LuLoaderCircle } from "react-icons/lu";
import Logo from "@/components/layout/Logo";
import Styles from "@/app/admin/admin.module.css";
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';


interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}
interface AdminAuthProps {
  onLogin: (admin: Admin) => void;
}


const AdminAuth: React.FC<AdminAuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      if (error || !data) {
        setError('Invalid email or password');
        return;
      }
      const adminSession = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('admin_session', JSON.stringify(adminSession));
      onLogin(data);
    } catch (err) {
      setError('Login failed. Please try again.' + err);
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className={Styles.adminAuth}>
      <Logo/>
      <form onSubmit={handleLogin}>
        <p>Email</p>
        <input id="email" name="email" type="email" placeholder="Enter email..." value={email} onChange={(e) => setEmail(e.target.value)} required/>
        <p>Password</p>
        <input id="password" name="password" type="password" placeholder="Enter password..." value={password} onChange={(e) => setPassword(e.target.value)} required/>
        {error && (
            <div className={Styles.error}>{error}</div>
          )}
        <button type="submit" disabled={loading}>{loading ? (<><LuLoaderCircle className="LoaderSpin"/> Logging in..</>) : (<>Login <LuLogIn/></>)}</button>
      </form>
    </div>
  );
}

export default AdminAuth;