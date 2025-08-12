"use client";
import Styles from "@/app/blog/blog.module.css";
import { LuSend, LuLoaderCircle, LuCheck } from "react-icons/lu";
import { useState, useEffect, useRef } from "react";

const LikeBox = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (visible && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.value ="";
    }
  }, [visible]);
  
  const openTextarea = (type: boolean) => {
    setVisible(true);
    setSelectedOption(type ? "Yes" : "No");
  }

  const handleSend = async () => {
    const message = `*Feedback from blog:*\n\`${window.location.href}\`\n\n*Was this blog helpful:* ${selectedOption}\n${text ? `*Message:* ${text}` : ""}`;
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
      setVisible(false);
      setSelectedOption("");
    }
  };
  
  return(
    <div className={Styles.likeBox}>
      <span>
        <p>Was This Blog Helpful?</p>
        <div className={Styles.likeBoxIcon}>
          <button onClick={()=>{openTextarea(true)}}>Yes {selectedOption === "Yes" && <LuCheck/>}</button>
          <button onClick={()=>{openTextarea(false)}}>No {selectedOption === "No" && <LuCheck/>}</button>
        </div>
      </span>
      <textarea ref={textareaRef} placeholder="Your feedback..." className={visible ? Styles.showLikeBoxTextarea : ""} value={text} onChange={(e) => setText(e.target.value)}/>
      <div className={`${visible ? Styles.showLikeBoxTextarea : ""} ${Styles.LikeBoxButton}`}><button className={sending ? Styles.LikeBoxButtonInactive : ""} onClick={()=>{handleSend()}}>Send {sending ? <LuLoaderCircle className="LoaderSpin"/> : <LuSend/>}</button></div>
    </div>
  );
}

export default LikeBox;