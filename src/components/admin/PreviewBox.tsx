"use client";
import { FC, ReactNode, CSSProperties, useMemo, memo } from "react";
import Code from "@/components/layout/Code";
import Styles from "@/app/admin/admin.module.css";

interface PreviewBoxProps {
  readonly style?: CSSProperties;
  readonly content?: string;
}

const parseAndRenderContent = (content: string): ReactNode => {
  if (!content) return null;

  const codeRegex = /<Code\s+language=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Code>/gi;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const htmlContent = content.slice(lastIndex, match.index);
      if (htmlContent.trim()) {
        parts.push(
          <div 
            key={`html-${key++}`}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        );
      }
    }

    const language = match[1];
    const codeContent = match[2];
    parts.push(
      <Code key={`code-${key++}`} language={language}>
        {codeContent}
      </Code>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remainingContent = content.slice(lastIndex);
    if (remainingContent.trim()) {
      parts.push(
        <div 
          key={`html-${key++}`}
          dangerouslySetInnerHTML={{ __html: remainingContent }}
        />
      );
    }
  }

  if (parts.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <>{parts}</>;
};

const PreviewBox: FC<PreviewBoxProps> = memo(({ style, content = "" }) => {
  const renderedContent = useMemo(() => parseAndRenderContent(content), [content]);

  return (
    <div className={Styles.previewBox} style={style}>
      {content ? (
        <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
          {renderedContent}
        </div>
      ) : (
        <p style={{ color: 'rgba(var(--color),0.5)', fontStyle: 'italic' }}>
          Start typing in the editor to see preview...
        </p>
      )}
    </div>
  );
});

export default PreviewBox;