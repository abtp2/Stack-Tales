'use client';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { LuEye, LuTrendingUp, LuDatabase, LuBox, LuImage, LuMousePointerClick, LuRefreshCcw, } from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import Styles from '@/app/admin/admin.module.css';
import { type User } from '@supabase/supabase-js';
import { useRouter } from "next/navigation";

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
}



const AdminAnalytics: React.FC<Props> = ({admin}) => {
  const supabase = createClient();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewsData, setViewsData] = useState<[]>([]);
  const [clicksData, setClicksData] = useState<[number, BlogClick[]]>([0, []]);
  const router = useRouter();
  
  const getViewsData = async ()=>{
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('views')
        if (error) throw error;
        let totalViews=0 ,monthViews=0 ,weekViews=0;
        data.forEach((row)=>{
          totalViews += row.views.length;
          row.views.forEach((rowViews)=>{
            if((Date.now() - rowViews) >= (1000*60*60*24*7)){
              weekViews++;
            }
            if((Date.now() - rowViews) >= (1000*60*60*24*30)){
              monthViews++;
            }
          })
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
        .select('clicks,title,slug')
        if (error) throw error;
        let totalClicks = 0;
        let blogClicks = [];
        data.forEach((row)=>{
          totalClicks += row.clicks;
          blogClicks.push({title:row.title, clicks:row.clicks, slug:row.slug})
        })
        blogClicks.sort((a, b) => b.clicks - a.clicks);
        setClicksData([totalClicks, blogClicks]);
    } catch (err) {
        console.error('Failed to fetch clicks data:', err);
    } finally {
        setTimeout(()=>{setRefreshing(false);}, 1000)
    }
  }
  useEffect(() => {
    getViewsData();
    getClicksData();
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
          <div className={Styles.adminAnalyticsClickData}>
            {clicksData[1] && (
            clicksData[1].map((data,index)=>(
              <span key={index}><i onClick={()=>{router.push(`/blog/${data.slug}`);}}>{data.title}</i><b>{data.clicks}</b></span>
            )))}
          </div>
        </div>
      </div>

      <br/><br/><br/>

      <h1><LuDatabase/> <p>Storage</p> <span>Storage Overview</span> <LuRefreshCcw className={Styles.adminAnalyticsRefresh}/></h1>
      <div className={Styles.adminAnalyticsContainer}>
        <div className={Styles.adminAnalyticsBox}>
          <LuBox/>
          <p>Supabase</p><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length":"30%"}}>50MB<span>Storage</span></div><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length":"60%"}}>279MB<span>Bucket</span></div>
        </div>
        <div className={Styles.adminAnalyticsBox}>
          <LuImage/>
          <p>ImageKit</p><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length":"80%"}}>2.7GB<span>Storage</span></div><br/>
          <div className={Styles.adminAnalyticsBar} style={{"--length":"50%"}}>1060/day<span>Requests</span></div>
        </div>
      </div>
    </div>
  );
}



export default AdminAnalytics;