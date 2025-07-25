"use client";
import AdminPanel from "@/components/admin/AdminPanel";
import AdminAuth from "@/components/admin/AdminAuth";
import {useState, useEffect} from "react";
import {LuLoaderCircle} from "react-icons/lu";
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
      <div style={{width:'90%',margin:'0 auto',height:'100vh',paddingTop:'10%',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:'10px'}}>
        <LuLoaderCircle className="LoaderSpin" style={{width:'30px',height:'30px'}}/>
        <span style={{marginTop:'1rem',height:'20px',width:'50%',maxWidth:'500px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
        <span style={{marginTop:'0px',height:'50px',width:'100%',maxWidth:'1000px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
        
        <span style={{marginTop:'1rem',height:'20px',width:'50%',maxWidth:'500px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
        <span style={{marginTop:'0px',height:'50px',width:'100%',maxWidth:'1000px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
        
        <span style={{marginTop:'1rem',height:'20px',width:'50%',maxWidth:'500px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
        <span style={{marginTop:'0px',height:'50px',width:'100%',maxWidth:'1000px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
      </div>
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