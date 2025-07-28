"use client";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminAuth from "@/components/admin/AdminAuth";
import {useState, useEffect, FC} from "react";
import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";
interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

const page: FC = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Check if admin is already logged in
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession) {
      try {
        const adminData = JSON.parse(savedSession);
        setAdmin(adminData);
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }
    setLoading(false);
  }, []);
  const handleLogin = (adminData: Admin) => {
    setAdmin(adminData);
  };
  const handleLogout = () => {
    setAdmin(null);
  };
  
  if (loading){
    return (
      <LoadingPlaceholder/>
    );
  }
  
  return(
    <>
      {admin ? (
        <AdminPanel admin={admin} onLogout={handleLogout} />
      ) : (
        <AdminAuth onLogin={handleLogin} />
      )}
    </>
  );
}

export default page;