"use client";
import { ChangeEvent, useState, useRef, useEffect } from "react";
import { createClient } from '@/lib/supabase/client';
import BlogToolbar from "./BlogToolbar";
import TagInput from "./TagInput";
import Styles from "@/app/admin/admin.module.css";
import { LuSave, LuExternalLink, LuEraser } from "react-icons/lu";

interface AdminData {
  id: string;
  email: string;
  name: string;
  username?: string;
  github_url?: string;
  linkedin_url?: string;
  avatar_url?: string;
  role: string;
}

interface Series {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorProps {
  blogId?: string | null; // Optional for editing existing blogs
  setBlogId: React.Dispatch<React.SetStateAction<string | null>>;
  blogTitle: string;
  setBlogTitle: React.Dispatch<React.SetStateAction<string>>;
  blogSeries: string | null;
  setBlogSeries: React.Dispatch<React.SetStateAction<string | null>>;
  blogTags: string[];
  setBlogTags: React.Dispatch<React.SetStateAction<string[]>>;
  blogContent: string;
  setBlogContent: React.Dispatch<React.SetStateAction<string>>;
  adminId?: string; // Admin ID to fetch admin data
}

const BlogEditor: FC<BlogEditorProps> = ({
  blogId,
  setBlogId,
  blogTitle,
  setBlogTitle,
  blogSeries,
  setBlogSeries,
  blogTags,
  setBlogTags,
  blogContent, 
  setBlogContent, 
  adminId
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  
  // State management
  const [series, setSeries] = useState<Series[]>([]);
  const [adminDataID, setAdminDataID] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Fetch data on component mount
  useEffect(() => {
    fetchSeries();
    if (!adminId && !adminDataID) {
      fetchCurrentUserAdmin();
    }
    if (blogId) {
      fetchBlogData();
    }
  }, [blogId, adminId, adminDataID]);

  const checkUserExists = async (userId) => {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('id', userId)
      .single();
    if (error) return false;
    return !!data;
  };
  
  const fetchCurrentUserAdmin = async () => {
    try {
      const session = localStorage.getItem('admin_session');
      if (session) {
        const sessionData = JSON.parse(session);
        checkUserExists(sessionData.id).then(exists => {
          if(exists) setAdminDataID(sessionData.id);
        });
      }
    } catch (error) {
      console.error('Error fetching current admin:', error);
      setMessage('Error loading user data');
    }
  };

  const fetchSeries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('series')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setSeries(data || []);
    } catch (error) {
      console.error('Error fetching series:', error);
      setMessage('Error loading series');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBlogData = async () => {
    if (!blogId) return;

    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('title, content, series_id, tags')
        .eq('id', blogId)
        .single();

      if (error) throw error;
      
      if (data) {
        setBlogTitle(data.title);
        setBlogContent(data.content);
        setBlogSeries(data.series_id);
        setBlogTags(data.tags);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setMessage('Error loading blog data');
    }
  };

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const handleSave = async () => {
    if (!blogTitle.trim()) {
      setMessage('Error : Please enter a blog title');
      return;
    }
    if(adminId && (adminId != adminDataID)){
      setMessage("Error : You cannot edit any other admin's blog");
      return;
    }
    if (!blogContent.trim()) {
      setMessage('Error : Please enter blog content');
      return;
    }
    if (!adminDataID) {
      setMessage('Error : Admin data not loaded. Please try again.');
      return;
    }
    try {
      setIsSaving(true);
      setMessage('');

      const blogData = {
        title: blogTitle.trim(),
        content: blogContent,
        series_id: blogSeries || null,
        tags: blogTags,
        author_id: adminDataID,
        slug: slugify(blogTitle.trim()),
        updated_at: new Date().toISOString(),
      };
      let result;
      
      if (blogId) {
        // Update existing blog (don't change author data on update)
        const updateData = {
          title: blogData.title,
          content: blogData.content,
          series_id: blogData.series_id,
          tags: blogData.tags,
          slug: slugify(blogData.title),
          updated_at: blogData.updated_at,
        };
        
        result = await supabase
          .from('blogs')
          .update(updateData)
          .eq('id', blogId);
      } else {
        // Create new blog with full author data
        result = await supabase
          .from('blogs')
          .insert([{
            ...blogData,
            created_at: new Date().toISOString(),
          }]);
      }

      if (result.error) throw result.error;

      setMessage(blogId ? 'Blog updated successfully!' : 'Blog saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving blog:', JSON.stringify(error));
      setMessage('Error saving blog. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setBlogContent("");
      setBlogTitle("");
      setBlogSeries("");
      setBlogTags([]);
      setMessage("");
    }
  };
  
  const CancelEditBlog = ()=> {
    try{
      setBlogId("");
      setBlogTitle("");
      setBlogSeries("");
      setBlogTags([])
      setBlogContent("");
    } catch (error){
      console.error("Error in cancelling blog editing");
    }
  }

  return (
    <div className={Styles.createBlogDiv}>
      {(blogId) && (
      <span className={Styles.createBlogEditingBlog}>
        <h1>Editing: <p>{blogTitle}</p> <LuExternalLink/> <button onClick={()=>{CancelEditBlog()}}>Cancel</button></h1>
      </span>
      )}

      <BlogToolbar textareaRef={textareaRef} />
      <div className={Styles.createBlogTitle}>
        <input 
          type="text" 
          placeholder="Write Title for blog" 
          value={blogTitle} 
          onChange={(e) => {setBlogTitle(e.target.value)}}
          disabled={isSaving}
          className={Styles.createBlogTitleInput}
        />
        <span className={Styles.createBlogSelectAndTags}>
          <select 
          value={blogSeries == null ? "" : blogSeries} 
          onChange={(e) => setBlogSeries(e.target.value)} 
          name="series"
          disabled={isLoading || isSaving}
        >
          <option value="">Select series (optional)</option>
          {series.map((seriesItem) => (
            <option key={seriesItem.id} value={seriesItem.id}>
              {seriesItem.name}
            </option>
          ))}
        </select>
        <TagInput
        blogTags={blogTags}
        setBlogTags={setBlogTags}
        />
        </span>
      </div>
      
      <textarea 
        ref={textareaRef}
        className={`${Styles.blogCode} overflow-none`} 
        placeholder="Start writing a blog..."
        aria-label="Blog content editor"
        value={blogContent}
        onChange={(e)=>{setBlogContent(e.target.value)}}
        disabled={isSaving}
      />
      
      {message && (
        <div className={`${Styles.message} ${message.includes('Error') ? Styles.error : Styles.success}`}>
          {message}
        </div>
      )}
      
      <span className={Styles.createBlogButtons}>
        <button 
          onClick={handleClear}
          disabled={isSaving}
          type="button"
        >
          <LuEraser/> Clear all
        </button>
        <button 
          onClick={()=>{handleSave()}}
          disabled={isSaving || !adminDataID}
          type="button"
        >
          <LuSave/> {isSaving ? 'Saving...' : 'Save'}
        </button>
      </span>
    </div>
  );
};

export default BlogEditor;