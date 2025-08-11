"use client";
import React, { useState, useCallback, ChangeEvent, KeyboardEvent, useEffect } from "react";
import Logo from "@/components/layout/Logo";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminNavigation from "./AdminNavigation";
import CreateBlog from "./CreateBlog";
import AllBlogs from "./AllBlogs";
import MediaUpload from './MediaUpload';
import { useAI } from "@/hooks/useAI";
import { loadBlogContentFromStorage, saveBlogContentToStorage } from "@/utils/blogStorage";
import { TabType, PreviewTabType } from "@/types/admin";
import { type User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client';
import Styles from "@/app/admin/admin.module.css";

interface AdminPanelProps {
  admin: User;
  setAdmin: React.Dispatch<React.SetStateAction<User | null>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ admin, setAdmin }) => {
  const [tab, setTab] = useState<TabType>("createBlog");
  const [previewTab, setPreviewTab] = useState<PreviewTabType>("preview");
  const [userDashbox, setUserDashbox] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [blogId, setBlogId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState<string>("");
  const [blogTags, setBlogTags] = useState<string[]>([]);
  const [blogSeries, setBlogSeries] = useState<string | null>("");
  const [blogContent, setBlogContent] = useState<string>("");
  const [adminAvatarUrl, setAdminAvatarUrl] = useState<string>("");
  const { aiLoading, components, generateText, addUserMessage } = useAI();


  // Load admin avatar
  useEffect(() => {
    const loadAdminAvatar = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('admins')
        .select('avatar_url')
        .eq('id', admin.id)
        .single();

      if (error || !data) {
        console.error('Avatar error:', error);
        setAdminAvatarUrl('/avatar.jpg');
      } else {
        setAdminAvatarUrl(data.avatar_url || '/avatar.jpg');
      }
    };
    loadAdminAvatar();
  }, [admin.id]);

  // Load blog draft from storage
  useEffect(() => {
    const saved = loadBlogContentFromStorage();
    if (saved) {
      setBlogId(saved.id);
      setBlogTitle(saved.title);
      setBlogSeries(saved.series_id);
      setBlogTags(saved.tags);
      setBlogContent(saved.content);
    }
  }, []);

  // Save blog draft with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      saveBlogContentToStorage({
        id: blogId || "",
        title: blogTitle,
        content: blogContent,
        series_id: blogSeries,
        tags: blogTags,
      });
    }, 500);
    return () => clearTimeout(handler);
  }, [blogId, blogTitle, blogContent, blogSeries, JSON.stringify(blogTags)]);

  const handleSendMessage = useCallback(() => {
    const trimmed = inputText.trim();
    if (trimmed && !aiLoading) {
      addUserMessage(trimmed);
      generateText(trimmed);
      setInputText("");
    }
  }, [inputText, aiLoading]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const renderTabContent = (): React.ReactElement | null => {
    switch (tab) {
      case "createBlog":
        return (
          <CreateBlog
            admin={admin}
            blogId={blogId}
            setBlogId={setBlogId}
            blogTitle={blogTitle}
            setBlogTitle={setBlogTitle}
            blogSeries={blogSeries}
            setBlogSeries={setBlogSeries}
            blogTags={blogTags}
            setBlogTags={setBlogTags}
            blogContent={blogContent}
            setBlogContent={setBlogContent}
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
          <AllBlogs
            admin={admin}
            blogId={blogId}
            setBlogId={setBlogId}
            tab={tab}
            setTab={setTab}
          />
        );
      case "analytics":
        return (
          <AdminAnalytics
          admin={admin}
          />
        );
      case "mediaUpload":
        return (
          <MediaUpload
            admin={admin}
          />
        );
      case "settings":
        return (
          <AdminSettings
            admin={admin}
            setAdmin={setAdmin}
            scale={userDashbox}
            setUserDashbox={setUserDashbox}
            userDashbox={userDashbox}
            adminAvatarUrl={adminAvatarUrl}
            setAdminAvatarUrl={setAdminAvatarUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <nav className={Styles.adminNav}>
        <Logo />
        <div className={Styles.adminImg} onClick={() => setTab("settings")}>
          <img src={adminAvatarUrl || "/avatar.jpg"} alt="Admin Avatar" />
        </div>
      </nav>
      <section>
        <AdminNavigation activeTab={tab} onTabChange={setTab} />
        <div className={Styles.product}>{renderTabContent()}</div>
      </section>
    </div>
  );
};

export default AdminPanel;