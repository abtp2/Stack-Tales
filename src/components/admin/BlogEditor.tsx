"use client";
import { ChangeEvent, useState, useRef, useEffect, FC } from "react";
import { createClient } from '@/lib/supabase/client';
import BlogToolbar from "./BlogToolbar";
import TagInput from "./TagInput";
import Styles from "@/app/admin/admin.module.css";
import { LuSave, LuExternalLink, LuEraser } from "react-icons/lu";
import { type User } from '@supabase/supabase-js'
import { useRouter } from "next/navigation";


interface Series {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorProps {
  admin: User | null;
  blogId?: string | null;
  setBlogId: React.Dispatch<React.SetStateAction<string | null>>;
  blogTitle: string;
  setBlogTitle: React.Dispatch<React.SetStateAction<string>>;
  blogSeries: string | null;
  setBlogSeries: React.Dispatch<React.SetStateAction<string | null>>;
  blogTags: string[];
  setBlogTags: React.Dispatch<React.SetStateAction<string[]>>;
  blogContent: string;
  setBlogContent: React.Dispatch<React.SetStateAction<string>>;
}

const BlogEditor: FC<BlogEditorProps> = ({
  admin,
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
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();

  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [editingBlogData, setEditingBlogData] = useState<{ [key: string]: any }>({});
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/blog');
  }, [router])
  
  useEffect(() => {
    fetchSeries();
    if (blogId) fetchBlogData();
  }, [blogId]);

  const fetchSeries = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('series').select('id, name, slug').order('name');
    if (!error && data) setSeries(data);
    setIsLoading(false);
  };

  const fetchBlogData = async () => {
    if (!blogId) return;
    const { data, error } = await supabase
      .from('blogs')
      .select('title, slug, content, series_id, tags')
      .eq('id', blogId)
      .single();
    if (!error && data) {
      setBlogTitle(data.title);
      setBlogContent(data.content);
      setBlogSeries(data.series_id);
      setBlogTags(data.tags || []);
      setEditingBlogData(data);
    }
  };

  const slugify = (text: string): string =>
    text.toLowerCase()
      .trim()
      .replace(/[\s\-_]+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+|-+$/g, '');

  const handleSave = async () => {
    if (!blogTitle.trim()) return setMessage('Error: Please enter a blog title');
    if (!admin) return setMessage('Error: Admin not authenticated');
    if (!blogContent.trim()) return setMessage('Error: Please enter blog content');

    
      setIsSaving(true);
      setMessage('');
      const blogData = {
        title: blogTitle.trim(),
        content: blogContent,
        series_id: blogSeries || null,
        tags: blogTags,
        slug: slugify(blogTitle.trim()),
        updated_at: new Date().toISOString(),
      };
      const result = blogId
        ? await supabase.from('blogs').update(blogData).eq('id', blogId)
        : await supabase.from('blogs').insert([{
            ...blogData,
            author_id: admin.id,
            created_at: new Date().toISOString(),
          }]);
      if (result.error) throw result.error;
      setMessage(blogId ? 'Blog updated successfully!' : 'Blog saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    handleClear();
    setIsSaving(false);
  };

  const handleClear = (mode?: "confirm") => {
    if(mode){
      if (window.confirm('Clear all content?')) {
        setBlogId(null)
        setBlogTitle("");
        setBlogContent("");
        setBlogSeries(null);
        setBlogTags([]);
        setMessage("");
      }
    }else{
      setBlogId(null)
      setBlogTitle("");
      setBlogContent("");
      setBlogSeries(null);
      setBlogTags([]);
    }
  };

  const cancelEdit = () => {
    handleClear();
  };

  return (
    <div className={Styles.createBlogDiv}>
      {blogId && (
        <span className={Styles.createBlogEditingBlog}>
          <h1>
            Editing: <p>{editingBlogData.title}</p> <LuExternalLink onClick={()=>{router.push(`/blog/${editingBlogData.slug}`);}}/>
            <button onClick={cancelEdit}>Cancel</button>
          </h1>
        </span>
      )}

      <BlogToolbar textareaRef={textareaRef} />

      <div className={Styles.createBlogTitle}>
        <input
          type="text"
          placeholder="Write Title for blog"
          value={blogTitle}
          onChange={(e) => setBlogTitle(e.target.value)}
          disabled={isSaving}
          className={Styles.createBlogTitleInput}
        />

        <span className={Styles.createBlogSelectAndTags}>
          <select
            value={blogSeries ?? ""}
            onChange={(e) => setBlogSeries(e.target.value)}
            disabled={isLoading || isSaving}
          >
            <option value="">Select series (optional)</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <TagInput blogTags={blogTags} setBlogTags={setBlogTags} />
        </span>
      </div>

      <textarea
        ref={textareaRef}
        className={Styles.blogCode}
        placeholder="Start writing a blog..."
        value={blogContent}
        onChange={(e) => setBlogContent(e.target.value)}
        disabled={isSaving}
      />

      {message && (
        <div className={`${Styles.message} ${message.includes("Error") ? Styles.error : Styles.success}`}>
          {message}
        </div>
      )}

      <span className={Styles.createBlogButtons}>
        <button onClick={()=>{handleClear("confirm")}} disabled={isSaving} type="button">
          <LuEraser /> Clear all
        </button>
        <button onClick={handleSave} disabled={isSaving || !admin} type="button">
          <LuSave /> {isSaving ? "Saving..." : "Save"}
        </button>
      </span>
    </div>
  );
};

export default BlogEditor;