"use client";
import Styles from "@/components/layout/layout.module.css";
import LoadingPlaceholder from "@/components/layout/LoadingPlaceholder";
import {useState, useEffect} from "react";
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';


const LatestBlogs = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [blogsData, setBlogsData] = useState<any[]>([]);
  const [authorsData, setAuthorsData] = useState<any[]>([]);
  const supabase = createClient();
  
  const loadBlogsData = async () => {
    setLoading(true);
    try{
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order("created_at", { ascending: false })
        .limit(5);
      if (error || !data) {
        console.error('Avatar error:', error);
        setBlogsData([]);
      }
      setBlogsData(data);
    } catch(error){
      console.error("Error fetching Blogs.")
    } finally{
      setLoading(false)
    }
  };
  
  const loadAuthorData = async () => {
    setLoading(true);
    try{
      const { data, error } = await supabase
        .from('admins')
        .select('id,avatar_url,username')
      if (error || !data) {
        console.error('Avatar error:', error);
        setAuthorsData([]);
      }
      setAuthorsData(data);
    } catch(error){
      console.error("Error fetching Blogs.")
    } finally{
      setLoading(false)
    }
  };
    
  useEffect(() => {
    loadBlogsData();
    loadAuthorData();
  }, []);
  

  return(
    <div className={Styles.latestblogs}>
      <h1 className={Styles.sectionHeading}>Latest Blogs</h1>
      {loading ? (<LoadingPlaceholder/>) : (
      blogsData.map((element,index) =>(
        <div key={index} className={Styles.latestBlogCard}>
          <span>
            <img src={authorsData.find(user => user.id === element.author_id)?.avatar_url} alt={authorsData.find(user => user.id === element.author_id)?.username} />
            <h1>{authorsData.find(user => user.id === element.author_id)?.username} <p>{new Date(element.created_at).toLocaleDateString("en-GB", { day:"2-digit",month:"long",year:"numeric"})}</p></h1>
          </span>
          <h2>{element.title}</h2>
          <h3>{element.content.replace(/<\/?[^>]+(>|$)/g, "").trim().replace(/\s+/g, " ").slice(0, 100).trim()}....</h3>
          <button><Link href={`/blog/${element.slug}`}>Read More</Link></button>
        </div>
      ))
      )}
    </div>
  );
}

export default LatestBlogs;