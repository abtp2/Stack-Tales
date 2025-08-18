'use client';
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import { createClient } from '@/lib/supabase/client';
import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";

interface Author {
  username: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  readme?: string;
}

export default function AuthorPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [authorData, setAuthorData] = useState<Author | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const value = searchParams.get('name');
  const authorName = value ? decodeURIComponent(value) : null;

  const supabase = createClient();

  useEffect(() => {
    if (!authorName) return;

    const fetchAuthorData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('admins')
        .select('username, avatar_url, github_url, linkedin_url, readme')
        .ilike('username', authorName)
        .limit(1);

      if (error) {
        console.error('Author fetch error:', error.message, error.details, error.hint);
        setError(`Author error: ${error.message}`);
      } else if (!data || data.length === 0) {
        console.log('No Author data found');
        setError("No Author found");
      } else {
        setAuthorData(data[0]);
      }

      setLoading(false);
    };

    fetchAuthorData();
  }, [authorName, supabase]);

  return (
    <>
      <Navbar />
      <section style={{ paddingTop: '65px' }}>
        {loading && <LoadingPlaceholder/>}
        {error && <p>{error}</p>}
        
        {authorData && (
          <div>
            <h2>{authorData.username}</h2>
            {authorData.avatar_url && (
              <img src={authorData.avatar_url} alt={authorData.username} width={100} height={100}/>
            )}
            {authorData.github_url && (
              <a href={authorData.github_url} target="_blank">GitHub</a>
            )}
            {authorData.linkedin_url && (
              <a href={authorData.linkedin_url} target="_blank">LinkedIn</a>
            )}
            {authorData.readme && (
              <pre style={{ whiteSpace: "pre-wrap" }}>{authorData.readme}</pre>
            )}
          </div>
        )}
      </section>
    </>
  );
}