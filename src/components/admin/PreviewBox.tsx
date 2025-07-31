"use client";
import { useState, useEffect, FC, ReactNode, CSSProperties, useMemo, memo } from "react";
import Code from "@/components/layout/Code";
import Styles from "@/app/admin/admin.module.css";
import { LuTwitter } from "react-icons/lu";
import { FaLinkedin } from "react-icons/fa";
import { createClient } from '@/lib/supabase/client';
import BlogStyles from "@/app/blog/blog.module.css";
import { type User } from '@supabase/supabase-js'


interface PreviewBoxProps {
  readonly style?: CSSProperties;
  readonly content?: string;
  blogTitle: string;
  setBlogTitle: React.Dispatch<React.SetStateAction<string>>;
  blogSeries: string | null;
  setBlogSeries: React.Dispatch<React.SetStateAction<string | null>>;
  blogTags: string[];
  setBlogTags: React.Dispatch<React.SetStateAction<string[]>>;
  admin: User;
}

interface AdminDataProps {
  username: string | null;
  aavatar_url: string | null;
}


const parseAndRenderContent = (content: string): ReactNode => {
  if (!content) return null;
  const codeRegex = /<Code\s+language=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Code>/gi;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const htmlContent = content.slice(lastIndex, match.index);
      if (htmlContent.trim()) {
        parts.push(
          <div 
            key={`html-${key++}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );
      }
    }
    const language = match[1];
    const codeContent = match[2];
    parts.push(
      <Code key={`code-${key++}`} language={language}>
        {codeContent}
      </Code>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex);
    if (remainingContent.trim()) {
      parts.push(
        <div 
          key={`html-${key++}`}
          dangerouslySetInnerHTML={{ __html: remainingContent }}
        />
      );
    }
  }
  if (parts.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <>{parts}</>;
};


const PreviewBox: FC<PreviewBoxProps> = memo(
  ({ style, content = "", blogTitle, setBlogTitle, blogSeries, setBlogSeries, blogTags, setBlogTags, admin }) => {
    const renderedContent = useMemo(() => parseAndRenderContent(content), [content]);
    const [adminData, setAdminData] = useState<AdminDataProps>([]);
    const supabase = createClient();
    
    useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const { data, error } = await supabase
          .from('admins')
          .select('username, avatar_url')
          .eq('id', admin.id)
          .single();
        if (error) throw error;
        setAdminData({
          username: data.username || '',
          avatar_url: data.avatar_url || '',
        });
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError('Could not load admin profile.');
      }
    };
    if (admin?.id) {
      fetchAdminData();
    }
  }, [admin.id]);
  
    return (
      <div className={`${Styles.previewBox} overflow-none`} style={style}>
        {content && admin ? (
          <div className={`${Styles.previewBoxBlogContent} overflow-none`}>
            <div className={BlogStyles.blogTitle}>
              <h2>{blogTitle}</h2>
              <span>
                <img src={adminData.avatar_url || "/avatar.jpg"} alt={adminData.username || "Admin"} />
                <h1>
                  {adminData.username}
                  <p>
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </h1>
              </span>
              <div>
                <p><LuTwitter /> Share on Twitter</p>
                <p><FaLinkedin /> Share on LinkedIn</p>
              </div>
            </div>
            <div className={BlogStyles.blogContent}>{renderedContent}</div>
          </div>
        ) : (
          <p style={{ color: "rgba(var(--color),0.5)", fontStyle: "italic" }}>
            Start typing in the editor to see preview...
          </p>
        )}
      </div>
    );
  }
);

export default PreviewBox;