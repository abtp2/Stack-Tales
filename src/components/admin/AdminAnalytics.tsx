'use client';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { LuEye, LuTrendingUp, LuDatabase, LuBox, LuImage, LuMousePointerClick, LuRefreshCcw, } from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import Styles from '@/app/admin/admin.module.css';
import { type User } from '@supabase/supabase-js';

interface Props {
  admin: User;
}

const AdminAnalytics: React.FC<Props> = ({admin}) => {
  const supabase = createClient();
  const [viewsData, setViewsData] = useState<[]>([]);
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
      }
  }
  useEffect(() => {
    getViewsData();
  }, []);
  
  
  
  return(
    <div className={Styles.adminAnalytics}>
      <h1><LuEye/> <p>Views</p> <span>Views Overview</span> <LuRefreshCcw onClick={()=>{getViewsData()}} className={Styles.adminAnalyticsRefresh}/></h1>
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
      
      <h1><LuMousePointerClick/> <p>Clicks</p> <span>Clicks Overview</span> <LuRefreshCcw className={Styles.adminAnalyticsRefresh}/></h1>
      <div className={Styles.adminAnalyticsContainer}>
        <div className={Styles.adminAnalyticsBox}>
          <LuEye/>
          <p>This Week</p>
          <h2>1234</h2>
        </div>
        <div className={Styles.adminAnalyticsBox}>
          <LuEye/>
          <p>This Month</p>
          <h2>5678</h2>
        </div>
        <div className={Styles.adminAnalyticsBox}>
          <LuTrendingUp/>
          <p>Total Views</p>
          <h2>9739</h2>
        </div>
      </div>

      <br/><br/><br/>

      <h1><LuDatabase/> <p>Storage</p> <span>Storage Overview</span> <LuRefreshCcw className={Styles.adminAnalyticsRefresh}/></h1>
      <div className={Styles.adminAnalyticsContainer}>
        <div className={Styles.adminAnalyticsBox}>
          <LuBox/>
          <p>Supabase</p><br/>
          <div className={Styles.adminAnalyticsBar}>28% <span>Table</span></div><br/>
          <div className={Styles.adminAnalyticsBar}>16.29% <span>Image</span></div>
        </div>
        <div className={Styles.adminAnalyticsBox}>
          <LuImage/>
          <p>ImageKit</p><br/>
          <div className={Styles.adminAnalyticsBar}>28% <span>Videos</span></div><br/>
          <div className={Styles.adminAnalyticsBar}>16.29% <span>Images</span></div>
        </div>
      </div>
    </div>
  );
}



export default AdminAnalytics;