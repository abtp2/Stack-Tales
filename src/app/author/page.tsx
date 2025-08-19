'use client';
import { useState, useEffect } from "react";
import { useSearchParams, notFound } from 'next/navigation';
import Navbar from "@/components/layout/Navbar";
import { createClient } from '@/lib/supabase/client';
import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";
import Styles from "./author.module.css";
import { FaGithub, FaLinkedin, FaTwitter, FaTelegram, FaYoutube } from "react-icons/fa";
import type { Tables } from '@/types/supabase';

type Author = Pick<
  Tables<'admins'>,
  | 'username'
  | 'avatar_url'
  | 'github_url'
  | 'linkedin_url'
  | 'telegram_url'
  | 'twitter_url'
  | 'youtube_url'
  | 'website_url'
  | 'readme'
>;

export default function AuthorPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [authorData, setAuthorData] = useState<Author | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const value = searchParams.get('name');
  const authorName = value ? decodeURIComponent(value) : null;

  if (!authorName) {
    notFound();
  }

  const supabase = createClient();

  useEffect(() => {
    if (!authorName) return;

    const fetchAuthorData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('admins')
        .select('username, avatar_url, github_url, linkedin_url, telegram_url, twitter_url, youtube_url, website_url, readme')
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
        {error && notFound()}
        {authorData && (
          <div className={Styles.container}>
            {authorData.avatar_url && (
              <img src={authorData.avatar_url} alt={authorData.username ?? ''} width={100} height={100}/>
            )}
            <div className={Styles.head}>
              {authorData.username && (
                <h1>{authorData.username}</h1>
              )}
              <span>
                {authorData.github_url && (
                  <a href={authorData.github_url}><FaGithub className={Styles.authorIcons}/></a>
                )}
                {authorData.linkedin_url && (
                  <a href={authorData.linkedin_url}><FaLinkedin  className={Styles.authorIcons}/></a>
                )}
                {authorData.twitter_url && (
                  <a href={authorData.twitter_url}><FaTwitter className={Styles.authorIcons}/></a>
                )}
                {authorData.telegram_url && (
                  <a href={authorData.telegram_url}><FaTelegram className={Styles.authorIcons}/></a>
                )}
                {authorData.youtube_url && (
                  <a href={authorData.youtube_url}><FaYoutube className={Styles.authorIcons}/></a>
                )}
              </span>
            </div>
            {authorData.readme && (
              <p dangerouslySetInnerHTML={{ __html: authorData.readme }}></p>
            )}
          </div>
        )}
      </section>
    </>
  );
}