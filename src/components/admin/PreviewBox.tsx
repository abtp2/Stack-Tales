"use client";
import { FC, ReactNode, CSSProperties, useMemo, memo, useState, useEffect } from "react";
import Code from "@/components/layout/Code";
import Styles from "@/app/admin/admin.module.css";
import { createClient } from '@/lib/supabase/client';
import { LuTwitter } from "react-icons/lu";
import { FaLinkedin } from "react-icons/fa";
import BlogStyles from "@/app/blog/blog.module.css";

interface PreviewBoxProps {
  readonly style?: CSSProperties;
  readonly content?: string;
  blogTitle: string;
  setBlogTitle: React.Dispatch<React.SetStateAction<string>>;
  blogSeries: string | null;
  setBlogSeries: React.Dispatch<React.SetStateAction<string | null>>;
  blogTags: string[];
  setBlogTags: React.Dispatch<React.SetStateAction<string[]>>;
}

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
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

const PreviewBox: FC<PreviewBoxProps> = memo(({ style, content = "",blog,
  Author,
  blogTitle,
  setBlogTitle,
  blogSeries,
  setBlogSeries,
  blogTags,
  setBlogTags }) => {
  const renderedContent = useMemo(() => parseAndRenderContent(content), [content]);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const loadAdminData = async () => {
    try {
      setLoading(true);
      // Get admin from session storage if no adminId provided
      const savedSession = localStorage.getItem('admin_session');
      let currentAdminId;
      if (savedSession) {
        try {
          const adminData = JSON.parse(savedSession);
          currentAdminId = adminData.id;
        } catch (error) {
          console.error("Error finding admin: " + err);
        }
      }
      if(!currentAdminId) throw new Error('No Current Admin')
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', currentAdminId)
        .single();
      if (error) throw error;
      setAdmin(data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadAdminData();
  }, []);
  
  return (
    <div className={`${Styles.previewBox} overflow-none`} style={style}>
      {(content && admin) ? (
        <div className={`${Styles.previewBoxBlogContent} overflow-none`}>
          <div className={BlogStyles.blogTitle}>
            <h2>{blogTitle}</h2>
            <span>
              <img src={admin.avatar_url} alt={admin.username} />
              <h1>{admin.username} <p>{new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}</p></h1>
            </span>
            <div>
              <p><LuTwitter /> Share on Twitter</p>
              <p><FaLinkedin /> Share on LinkedIn</p>
            </div>
          </div>
          <div className={BlogStyles.blogContent}>
            {renderedContent}
          </div>
        </div>
      ) : (
        <p style={{ color: 'rgba(var(--color),0.5)', fontStyle: 'italic' }}>
          Start typing in the editor to see preview...
        </p>
      )}
    </div>
  );
});

export default PreviewBox;