'use client';
import { useEffect, useState, useMemo, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import Styles from "../blog.module.css";
import Code from "@/components/layout/Code";
import LikeBox from "@/components/layout/LikeBox";
import { LuTwitter, LuChevronRight, LuSquareLibrary } from "react-icons/lu";
import { FaLinkedin } from "react-icons/fa";
import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";

interface BlogClientProps {
  slug: string;
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

export default function BlogClient({ slug }: BlogClientProps) {
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<any>(null);
  const [Author, setAuthor] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [blogSeries, setBlogSeries] = useState<string >('');
  const [blogViews, setBlogViews] = useState<string[]>([]);
  
  const shareToTwitter = () => {
    const twitterURL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`
    window.open(twitterURL, '_blank', 'noopener,noreferrer')
  }
  const shareToLinkedIn = () => {
    const linkedInURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
    window.open(linkedInURL, '_blank', 'noopener,noreferrer')
  }
  
  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching blog with slug:', slug);
      const supabase = createClient();
      
      // First, let's check what blogs exist
      const { data: allBlogs, error: allBlogsError } = await supabase
        .from('blogs')
        .select('slug, title, tags');
      console.log('All available blogs:', allBlogs);
      console.log('All blogs error:', allBlogsError);
      
      // Now fetch the specific blog
      const { data: blogData, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();
      console.log('Blog error:', blogError);
      if (blogError) {
        console.error('Blog fetch error:', blogError);
        setError(`Blog error: ${blogError.message}`);
        setLoading(false);
        return;
      }
      if (!blogData) {
        console.log('No blog data found');
        setError("No blog found with this slug");
        setLoading(false);
        return;
      }
      
      // Fetch Author data
      const { data: AuthorData, error: AuthorError } = await supabase
        .from('admins')
        .select('username, avatar_url, github_url, linkedin_url')
        .eq('id', blogData.author_id)
        .single();
      if (AuthorError) {
        console.error('Author fetch error:', JSON.stringify(AuthorError));
        setError(`Author error: ${AuthorError.message}`);
        setLoading(false);
        return;
      }
      if (!AuthorData) {
        console.log('No Author data found');
        setError("No Author found for this blog");
        setLoading(false);
        return;
      }
      
      // Fetch blog series
      const { data: SeriesData, error: SeriesError } = await supabase
        .from('series')
        .select('name')
        .eq('id', blogData.series_id)
        .single();
      if (!SeriesData) {
        setBlogSeries(null);
      }
      
      // Views
        const viewsStorage = JSON.parse(sessionStorage.getItem("StackTales-views") || "[]");
        if (!viewsStorage.some(item => item.id === blogData.id)) {
          const date = Date.now();
          // Fetch current views (optional — if you don't need existing views, skip this)
          const { data: viewsData, error: viewsError } = await supabase
            .from('blogs')
            .select('views')
            .eq('id', blogData.id)
            .single();
          if (viewsError) {
            console.error("Error fetching views:", viewsError);
            return;
          }
          // Add current date to views array
          const updatedViews = Array.isArray(viewsData.views) ? [...viewsData.views, date] : [date];
          const { data, error } = await supabase
            .from('blogs')
            .update({ views: updatedViews })
            .eq('id', blogData.id);
          if (error) {
            console.error("Error updating views:", error);
            return;
          }
          // Update sessionStorage
          const updatedStorage = [...viewsStorage, { id: blogData.id, date }];
          sessionStorage.setItem("StackTales-views", JSON.stringify(updatedStorage));
        }
        
      
      
      setBlog(blogData);
      setAuthor(AuthorData);
      setBlogSeries(SeriesData);
      setLoading(false);
    };
    
    if (slug) {
      fetchData();
    } else {
      setError("No slug provided");
      setLoading(false);
    }
  }, [slug]);

  const renderedContent = useMemo(() => {
    return blog?.content ? parseAndRenderContent(blog.content) : null;
  }, [blog?.content]);

  if (loading) {
    return (
      <LoadingPlaceholder/>
    );
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <p>Slug: {slug}</p>
      </div>
    );
  }

  return (
    <section>
      {blog.tags.length > 0 && (
        <div className={`${Styles.blogTags} overflow-none`}>
          {blog.tags.map((tag) => (
            <p key={tag}>{tag}</p>
          ))}
        </div>
      )}
      {blogSeries && (
        <div className={`${Styles.blogSeriesBox} overflow-none`}>
          <p><LuSquareLibrary/> &nbsp;|&nbsp; <span>{blogSeries.name}</span> <LuChevronRight/> <span>{blog.title}</span></p>
        </div>
      )}
      <main className={Styles.blogContainer}>
        <div className={Styles.blogTitle}>
          <h2>{blog.title}</h2>
          <span>
            <img src={Author.avatar_url} alt={Author.username} />
            <h1>{Author.username} <p>{new Date(blog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}</p></h1>
          </span>
          <div>
            <p onClick={()=>{shareToTwitter()}}><LuTwitter /> Share on Twitter</p>
            <p onClick={()=>{shareToLinkedIn()}}><FaLinkedin /> Share on LinkedIn</p>
          </div>
        </div>
        <div className={Styles.blogContent}>
          {renderedContent}
        </div>
      </main>
      <LikeBox/>
    </section>
  );
}