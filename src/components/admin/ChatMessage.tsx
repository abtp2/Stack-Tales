"use client";
import { FC, memo } from "react";
import Markdown from 'react-markdown';
import type { CodeProps } from 'react-markdown/lib/ast-to-react';
import Code from "@/components/layout/Code";
import Styles from "@/app/admin/admin.module.css";

interface ChatMessageProps {
  readonly id: string;
  readonly text: string;
  readonly type: "user" | "ai";
}

const ChatMessage: FC<ChatMessageProps> = memo(({ id, text, type }) => (
  <span className={type === "user" ? Styles.AIBoxUserMessage : Styles.AIBoxAIMessage}>
    {type === "user" ? (
      <p>{text}</p>
    ) : (
      <Markdown
        components={{
          code: ({ node, inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match?.[1] ?? '';
            if (!inline && match) {
              return (
                <Code language={language}>
                  {String(children).replace(/\n$/, '')}
                </Code>
              );
            }
            return (
              <code 
                style={{ padding: '0 !important', background: 'var(--fade)' }} 
                {...props}
              >
                {children}
              </code>
            );
          }
        }}>
        {text}
      </Markdown>
    )}
  </span>
));

export default ChatMessage;