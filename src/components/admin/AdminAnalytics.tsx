'use client';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { LuEye, LuTrendingUp, LuDatabase, LuBox, LuImage, LuMousePointerClick, LuRefreshCcw, LuUsers, LuExternalLink } from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import Styles from '@/app/admin/admin.module.css';
import { type User } from '@supabase/supabase-js';
import { useRouter } from "next/navigation";
import Link from 'next/link';

interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}
interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}
interface ImageKitUsage {
  storageMB: string;
  bandwidthMB: string;
  requests: number;
}
interface SupabaseUsage {
  storageMB: string;
  bucketCount: number;
}
interface Props {
  admin: User;
}
interface BlogClick {
  title: string;
  clicks: number;
  slug: string;
  author_id: string;
  views: any[] | null;
}
interface Author {
  id: string;
  avatar_url: string | null;
  username: string | null;
  created_at: string | null;
  role: string | null;
}



const AdminAnalytics: React.FC<Props> = ({admin}) => {
  const supabase = createClient();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewsData, setViewsData] = useState<[number, number, number]>([0, 0, 0]);
  const [clicksData, setClicksData] = useState<[number, BlogClick[]]>([0, []]);
  const [authorData, setAuthorData] = useState<Author[]>([]);
  const router = useRouter();
  
  const getViewsData = async ()=>{
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('views')
        if (error) throw error;
        let totalViews=0 ,monthViews=0 ,weekViews=0;
        data?.forEach((row)=>{
          if (row.views && Array.isArray(row.views)) {
            totalViews += row.views.length;
            row.views.forEach((rowViews)=>{
              const timestamp = parseInt(rowViews);
              if(!isNaN(timestamp) && (Date.now() - timestamp) <= (1000*60*60*24*7)){
                weekViews++;
              }
              if(!isNaN(timestamp) && (Date.now() - timestamp) <= (1000*60*60*24*30)){
                monthViews++;
              }
            })
          }
        })
        setViewsData([weekViews,monthViews,totalViews]);
    } catch (err) {
        console.error('Failed to fetch views data:', err);
    } finally{
        setTimeout(()=>{setRefreshing(false);}, 1000)
    }
  }
  
  const getClicksData = async ()=>{
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('clicks,title,slug,views,author_id')
        if (error) throw error;
        let totalClicks = 0;
        let blogClicks: BlogClick[] = [];
        data?.forEach((row)=>{
          if (row.clicks !== null && row.clicks !== undefined) {
            totalClicks += row.clicks;
            blogClicks.push({title:row.title || '', clicks:row.clicks, slug:row.slug || '', author_id:row.author_id || '', views: row.views ?? [] })
          }
        })
        blogClicks.sort((a, b) => b.clicks - a.clicks);
        setClicksData([totalClicks, blogClicks]);
    } catch (err) {
        console.error('Failed to fetch clicks data:', err);
    } finally {
        setTimeout(()=>{setRefreshing(false);}, 1000)
    }
  }
  
  const getAuthorsData = async ()=>{
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id,avatar_url,username,created_at,role')
        if (error) throw error;
        setAuthorData(data);
    } catch (err) {
        console.error('Failed to fetch author data:', err);
    } finally {
        setTimeout(()=>{setRefreshing(false);}, 1000)
    }
  }
  useEffect(() => {
    getViewsData();
    getClicksData();
    getAuthorsData();
  }, []);
  
  
  
  return(
    <div className={Styles.adminAnalytics}>
      <h1><LuEye/> <p>Views</p> <span>Views Overview</span> <LuRefreshCcw onClick={()=>{getViewsData(); setRefreshing(true);}} className={`${Styles.adminAnalyticsRefresh} ${refreshing ? Styles.adminAnalyticsRefreshActive : ""}`}/></h1>
      <div className={Styles.adminAnalyticsContainer}>
        <div className={Styles.adminAnalyticsBox}>
          <LuEye/>
          <p>This Week</p>
          <h2>{viewsData[0]}</h2>
        </div>
        <div className={Styles.adminAnalyticsBox}>
          <LuEye/>
          <p>This Month</p>
          <h2>{viewsData[1]}</h2>
        </div>
        <div className={Styles.adminAnalyticsBox}>
          <LuTrendingUp/>
          <p>Total Views</p>
          <h2>{viewsData[2]}</h2>
        </div>
      </div>

      <br/><br/><br/>
      
      <h1><LuMousePointerClick/> <p>Clicks</p> <span>Clicks Overview</span> <LuRefreshCcw onClick={()=>{getClicksData(); setRefreshing(true);}} className={`${Styles.adminAnalyticsRefresh} ${refreshing ? Styles.adminAnalyticsRefreshActive : ""}`}/></h1>
      <div className={Styles.adminAnalyticsContainer}>
        <div className={`${Styles.adminAnalyticsBox} ${Styles.bigAdminAnalyticsBox}`}>
          <LuTrendingUp/>
          <p>Total Clicks - <b>{clicksData[0]}</b></p>
          <div className={`${Styles.adminAnalyticsClickData} custom-scrollbar`}>
            {clicksData[1] && (
            clicksData[1].map((data,index)=>(
              <span key={index}><i onClick={()=>{router.push(`/blog/${data.slug}`);}}>{data.title}</i><b>{data.clicks}</b></span>
            )))}
          </div>
        </div>
      </div>

      <br/><br/><br/>
      
      <h1><LuUsers/> <p>Authors Performance</p> <span>Authors performance Overview</span> <LuRefreshCcw onClick={()=>{getAuthorsData(); setRefreshing(true);}} className={`${Styles.adminAnalyticsRefresh} ${refreshing ? Styles.adminAnalyticsRefreshActive : ""}`}/></h1>
      <div className={Styles.adminAnalyticsContainer}>
        <div className={`${Styles.adminAnalyticsBox} ${Styles.bigAdminAnalyticsBox}`}>
          <LuTrendingUp/>
          <p>Total Authors - <b>{authorData.length}</b></p>
          <div className={Styles.adminAnalyticsAuthorsData}>
            {authorData && (
            authorData.map((data,index)=>(
              <details key={index}>
                <summary><img src={data.avatar_url || ''} alt={data.username || ''}/><b>{data.username || ''}</b><i>{data.role || ''}</i></summary>
                <div>
                  <span>Profile -&nbsp;<b onClick={()=>{router.push(`/author?name=${data.username || ''}`)}}><LuExternalLink/></b></span>
                  <span>Total Blogs -&nbsp;<b>{clicksData[1].filter(item => item.author_id == data.id).length}</b></span>
                  <span>Most Viewed -&nbsp;<b onClick={()=>{
                    const authorBlogs = clicksData[1]?.filter(item => item.author_id === data.id) || [];
                    const mostViewed = authorBlogs.reduce((max, item) => {
                      const currentViews = item.views?.length || 0;
                      const maxViews = max?.views?.length || 0;
                      return currentViews > maxViews ? item : max;
                    }, null as BlogClick | null);
                    if (mostViewed?.slug) {
                      router.push(`/blog/${mostViewed.slug}`);
                    }
                  }}><LuExternalLink/></b></span>
                  <span>Most Clicked -&nbsp;<b onClick={()=>{
                    const authorBlogs = clicksData[1]?.filter(item => item.author_id === data.id) || [];
                    const mostClicked = authorBlogs.reduce((max, item) => {
                      return item.clicks > (max?.clicks ?? 0) ? item : max;
                    }, null as BlogClick | null);
                    if (mostClicked?.slug) {
                      router.push(`/blog/${mostClicked.slug}`);
                    }
                  }}><LuExternalLink/></b></span>
                  <span>Joined On -&nbsp;<b>{new Date(data.created_at || '').toLocaleDateString("en-GB")}</b></span>
                </div>
              </details>
            )))}
          </div>
        </div>
      </div>


      <br/><br/><br/>

      <h1><LuDatabase/> <p>Storage</p> <span>Storage Overview</span> <LuRefreshCcw className={Styles.adminAnalyticsRefresh}/></h1>
      <div className={Styles.adminAnalyticsContainer}>
        <div className={`${Styles.adminAnalyticsBox} ${Styles.twoBigAdminAnalyticsBox}`}>
          <LuBox/>
          <p>Supabase</p><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length": "30%"} as React.CSSProperties}>50MB<span>Storage</span></div><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length": "60%"} as React.CSSProperties}>279MB<span>Bucket</span></div>
        </div>
        <div className={`${Styles.adminAnalyticsBox} ${Styles.twoBigAdminAnalyticsBox}`}>
          <LuImage/>
          <p>ImageKit</p><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length": "80%"} as React.CSSProperties}>2.7GB<span>Storage</span></div><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length": "50%"} as React.CSSProperties}>1060/day<span>Requests</span></div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;