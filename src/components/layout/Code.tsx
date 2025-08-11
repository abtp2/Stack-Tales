"use client";
import React, { useState, FC } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Styles from "@/app/blog/blog.module.css";
import AdminStyles from "@/app/admin/admin.module.css";
import { LuCopy,LuCheck } from "react-icons/lu";

interface CodeProps {
  children: string;
  language?: string;
}

const Code: FC<CodeProps> = ({ children, language = "javascript" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className={`${Styles.blogCodeBox} ${AdminStyles.blogCodeBox}`}>
      <span>
        <LuCheck style={copied ? {display:'block',zIndex:'2'} : {display:'none'}}/> <LuCopy className={Styles.blogCodeCopy} onClick={handleCopy}/>
      </span>
      <SyntaxHighlighter language={language} style={nightOwl} className={`${Styles.blogCodeBlock} ${AdminStyles.blogCodeBlock}`}>
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

export default Code;