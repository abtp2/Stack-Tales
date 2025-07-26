"use client";
import { useState, useCallback, ChangeEvent, KeyboardEvent, useEffect } from "react";
import Logo from "@/components/layout/Logo";
import AdminDashbox from "@/components/admin/AdminDashbox";
import AdminNavigation from "./AdminNavigation";
import CreateBlog from "./CreateBlog";
import AllBlogs from "./AllBlogs";
import { useAI } from "@/hooks/useAI";
import { loadBlogContentFromStorage, saveBlogContentToStorage } from "@/utils/blogStorage";
import { Admin, TabType, PreviewTabType } from "@/types/admin";
import { createClient } from '@/lib/supabase/client';
import Styles from "@/app/admin/admin.module.css";

interface AdminPanelProps {
  admin: Admin;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ admin, onLogout }) => {
  const [tab, setTab] = useState<TabType>("createBlog");
  const [previewTab, setPreviewTab] = useState<PreviewTabType>("preview");
  const [userDashbox, setUserDashbox] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [blogContent, setBlogContent] = useState<string>("");
  const [adminAvatarUrl, setAdminAvatarUrl] = useState<string>("");
  
  const { aiLoading, components, generateText, addUserMessage } = useAI();
  const supabase = createClient();

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    onLogout();
  };

  // Load admin avatar URL from Supabase
  useEffect(() => {
    const loadAdminAvatar = async () => {
      try {
        // Get admin ID from session storage
        const session = localStorage.getItem('admin_session');
        let adminId = admin?.id;
        
        if (!adminId && session) {
          const sessionData = JSON.parse(session);
          adminId = sessionData.id;
        }

        if (adminId) {
          const { data, error } = await supabase
            .from('admins')
            .select('avatar_url')
            .eq('id', adminId)
            .single();

          if (error) {
            console.error('Error fetching admin avatar:', error);
          } else {
            setAdminAvatarUrl(data.avatar_url || '/avatar.jpg');
          }
        }
      } catch (err) {
        console.error('Error loading admin avatar:', err);
        setAdminAvatarUrl('/avatar.jpg');
      }
    };

    loadAdminAvatar();
  }, [admin?.id, supabase]);

  // Load blog content from localStorage on component mount
  useEffect(() => {
    const savedContent = loadBlogContentFromStorage();
    if (savedContent) {
      setBlogContent(savedContent);
    }
  }, []);

  // Save blog content to localStorage whenever it changes
  useEffect(() => {
    saveBlogContentToStorage(blogContent);
  }, [blogContent]);

  const handleSendMessage = useCallback((): void => {
    const trimmedInput = inputText.trim();
    if (trimmedInput && !aiLoading) {
      addUserMessage(trimmedInput);
      generateText(trimmedInput);
      setInputText("");
    }
  }, [inputText, aiLoading, addUserMessage, generateText]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleBlogContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
    setBlogContent(e.target.value);
  }, []);

  const renderTabContent = (): JSX.Element | null => {
    switch (tab) {
      case "createBlog":
        return (
          <CreateBlog
            blogContent={blogContent}
            setBlogContent={setBlogContent}
            onBlogContentChange={handleBlogContentChange}
            previewTab={previewTab}
            onPreviewTabChange={setPreviewTab}
            components={components}
            aiLoading={aiLoading}
            inputText={inputText}
            handleInputChange={handleInputChange}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
          />
        );
      case "addBlog":
        return (
          <AllBlogs/>
        );
      case "analytics":
        return <div>Analytics Content - Coming Soon</div>;
      case "settings":
        return <div>Settings Content - Coming Soon</div>;
      default:
        return null;
    }
  };

  return (
    <div className={userDashbox ? Styles.dashboxBlur : ""}>
      <nav className={Styles.adminNav} role="banner">
        <Logo />
        <AdminDashbox 
          scale={userDashbox} 
          adminId={admin.id} 
          onLogout={handleLogout} 
          setUserDashbox={setUserDashbox} 
          userDashbox={userDashbox}
          adminAvatarUrl ={adminAvatarUrl}
          setAdminAvatarUrl ={setAdminAvatarUrl}
        />
        <div className={Styles.adminImg} onClick={() => setUserDashbox(true)}>
          <p>Admin Account</p>
          <img src={adminAvatarUrl || "/avatar.jpg"} alt="Admin Avatar" />
        </div>
      </nav>
      <section role="main">
        <AdminNavigation 
          activeTab={tab}
          onTabChange={setTab}
        />
        <div className={Styles.product}>
          {renderTabContent()}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;