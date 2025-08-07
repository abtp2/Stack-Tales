"use client";
import Styles from "@/app/blog/blog.module.css";
import { BiSolidLike, BiSolidDislike} from "react-icons/bi";
import { LuSend, LuLoaderCircle } from "react-icons/lu";
import { useState, useEffect, useRef } from "react";

const LikeBox = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (visible && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.value ="";
    }
  }, [visible]);
  

  const handleSend = async () => {
    if (!text.trim()) return;
    const message = `Query from blog:\n\`${window.location.href}\`\n\n${text}`;
    setSending(true);
    try {
      const res = await fetch('/api/sendTelegramMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.ok) {
        setText('');
      } else {
        throw new Error(data.description || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  
  useEffect(() => {
    handleSend();
  }, [])
  
  return(
    <div className={Styles.likeBox} onMouseLeave={()=>{setVisible(false)}}>
      <span>
        <p>Was This Blog Helpful?</p>
        <div className={Styles.likeBoxIcon} onMouseEnter={()=>{setVisible(true)}}><BiSolidLike/></div>
        <div className={Styles.likeBoxIcon} onMouseEnter={()=>{setVisible(true)}}><BiSolidDislike/></div>
      </span>
      <textarea ref={textareaRef} placeholder="Your feedback..." className={visible ? Styles.showLikeBoxTextarea : ""} value={text} onChange={(e) => setText(e.target.value)}/>
      <div className={`${visible ? Styles.showLikeBoxTextarea : ""} ${Styles.LikeBoxButton}`}><button className={sending ? Styles.LikeBoxButtonInactive : ""} onClick={()=>{handleSend()}}>Send {sending ? <LuLoaderCircle className="LoaderSpin"/> : <LuSend/>}</button></div>
    </div>
  );
}

export default LikeBox;