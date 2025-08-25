'use client';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { LuEye, LuTrendingUp, LuDatabase, LuBox, LuImage, LuMousePointerClick, } from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import Styles from '@/app/admin/admin.module.css';
import { type User } from '@supabase/supabase-js';

interface Props {
  admin: User;
}

const AdminAnalytics: React.FC<Props> = ({admin}) => {
  return(
    <div className={Styles.adminAnalytics}>
      <h1><LuEye/> <p>Views</p> <span>Views Overview</span></h1>
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
      
      <h1><LuMousePointerClick/> <p>Clicks</p> <span>Clicks Overview</span></h1>
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

      <h1><LuDatabase/> <p>Storage</p> <span>Storage Overview</span></h1>
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