'use client';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { LuPenLine } from 'react-icons/lu';
import { createClient } from '@/lib/supabase/client';
import Styles from '@/app/admin/admin.module.css';
import { type User } from '@supabase/supabase-js'

interface Props {
  admin: User;
}

const AdminAnalytics: React.FC<Props> = ({admin}) => {
  return(
    <div className={Styles.adminAnalytics}>
      <h1>Ashutosh Pandey </h1>
    </div>
  );
}



export default AdminAnalytics;