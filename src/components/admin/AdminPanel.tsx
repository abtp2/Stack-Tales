"use client";
import { FC, ReactNode, CSSProperties, useState, useCallback, KeyboardEvent, ChangeEvent, useRef, memo, useMemo, useEffect } from "react";
import Logo from "@/components/layout/Logo";
import Styles from "@/app/admin/admin.module.css";
import Code from "@/components/layout/Code";
import { LuPencilLine,LuFileText,LuChartLine,LuSettings,LuArrowUp, LuHeading1,LuHeading2,LuHeading3,LuBold,LuPilcrow,LuCode,LuList,LuListOrdered,LuQuote } from "react-icons/lu";
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import type { CodeProps } from 'react-markdown/lib/ast-to-react';

const BLOG_CONTENT_STORAGE_KEY = 'admin_blog_content';

const initializeAI = (): GoogleGenAI | null => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.warn("Google AI API key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};
const ai = initializeAI();

interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}
interface AdminPanelProps {
  admin: Admin;
  onLogout: () => void;
}
interface BlogTool {
  readonly title: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
}
interface ChatMessage {
  readonly id: string;
  readonly text: string;
  readonly type: "user" | "ai";
  readonly timestamp: Date;
}
interface ChatMessageProps {
  readonly id: string;
  readonly text: string;
  readonly type: "user" | "ai";
}
interface PreviewBoxProps {
  readonly style?: CSSProperties;
  readonly content?: string;
}
interface AIBoxProps {
  readonly style?: CSSProperties;
  readonly components: readonly ChatMessage[];
  readonly aiLoading: boolean;
  readonly inputText: string;
  readonly handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  readonly handleSendMessage: () => void;
}
type TabType = "createBlog" | "addBlog" | "analytics" | "settings";
type PreviewTabType = "preview" | "ai";

const createBlogToolsList = (
  textareaRef: React.RefObject<HTMLTextAreaElement>
): readonly BlogTool[] => [
  {
    title: "Heading 1",
    icon: <LuHeading1 />,
    onClick: (): void => insertText(textareaRef, "<h1>", "</h1>")
  },
  {
    title: "Heading 2", 
    icon: <LuHeading2 />,
    onClick: (): void => insertText(textareaRef, "<h2>", "</h2>")
  },
  {
    title: "Heading 3",
    icon: <LuHeading3 />,
    onClick: (): void => insertText(textareaRef, "<h3>", "</h3>")
  },
  {
    title: "Bold",
    icon: <LuBold />,
    onClick: (): void => insertText(textareaRef, "<b>", "</b>")
  },
  {
    title: "Paragraph",
    icon: <LuPilcrow />,
    onClick: (): void => insertText(textareaRef, "<p>", "</p>")
  },
  {
    title: "Code Block",
    icon: <LuCode />,
    onClick: (): void => insertText(textareaRef, "<Code language=\"javascript\">", "</Code>")
  },
  {
    title: "Unordered List",
    icon: <LuList />,
    onClick: (): void => insertHtmlList(textareaRef, "ul")
  },
  {
    title: "Ordered List",
    icon: <LuListOrdered />,
    onClick: (): void => insertHtmlList(textareaRef, "ol")
  },
  {
    title: "Blockquote",
    icon: <LuQuote />,
    onClick: (): void => insertText(textareaRef, "<blockquote>", "</blockquote>")
  }
] as const;

// Helper function to load content from localStorage
const loadBlogContentFromStorage = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const savedContent = localStorage.getItem(BLOG_CONTENT_STORAGE_KEY);
    return savedContent || '';
  } catch (error) {
    console.warn('Error loading blog content from localStorage:', error);
    return '';
  }
};

// Helper function to save content to localStorage
const saveBlogContentToStorage = (content: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BLOG_CONTENT_STORAGE_KEY, content);
  } catch (error) {
    console.warn('Error saving blog content to localStorage:', error);
  }
};

// Helper function to insert HTML list structure
const insertHtmlList = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  listType: "ul" | "ol"
): void => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const beforeText = textarea.value.substring(0, start);
  const afterText = textarea.value.substring(end);

  // Create list structure with one item
  const listContent = selectedText || "List item";
  const htmlList = `<${listType}>\n  <li>${listContent}</li>\n</${listType}>`;
  const newText = beforeText + htmlList + afterText;
  textarea.value = newText;
  
  // Set cursor position inside the first list item
  const newCursorPos = start + `<${listType}>\n  <li>`.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos + listContent.length);
  textarea.focus();
  
  // Trigger change event to update React state
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};

// Helper function to insert text at cursor position
const insertText = (
  textareaRef: React.RefObject<HTMLTextAreaElement>,
  before: string,
  after: string
): void => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const beforeText = textarea.value.substring(0, start);
  const afterText = textarea.value.substring(end);
  const newText = beforeText + before + selectedText + after + afterText;
  textarea.value = newText;
  
  // Set cursor position - if there was selected text, position after it, otherwise between tags
  const newCursorPos = selectedText 
    ? start + before.length + selectedText.length + after.length
    : start + before.length;
  textarea.setSelectionRange(newCursorPos, newCursorPos);
  textarea.focus();
  
  // Trigger change event to update React state
  const event = new Event('input', { bubbles: true });
  textarea.dispatchEvent(event);
};

// Function to parse HTML content and render custom components
const parseAndRenderContent = (content: string): ReactNode => {
  if (!content) return null;

  // Split content by Code components while preserving them
  const codeRegex = /<Code\s+language=["']([^"']+)["'][^>]*>([\s\S]*?)<\/Code>/gi;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeRegex.exec(content)) !== null) {
    // Add HTML content before the Code component
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

    // Add the Code component
    const language = match[1];
    const codeContent = match[2];
    parts.push(
      <Code key={`code-${key++}`} language={language}>
        {codeContent}
      </Code>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add any remaining HTML content after the last Code component
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

  // If no Code components were found, render the entire content as HTML
  if (parts.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <>{parts}</>;
};

// Memoized ChatMessageComponent to prevent unnecessary re-renders
const ChatMessageComponent: FC<ChatMessageProps> = memo(({ id, text, type }) => (
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

const AIBox: FC<AIBoxProps> = memo(({ 
  style, 
  components, 
  aiLoading, 
  inputText, 
  handleInputChange, 
  handleKeyPress, 
  handleSendMessage 
}) => {
  const chatMessages = useMemo(() => 
    components.map((comp) => (
      <ChatMessageComponent 
        key={comp.id}
        id={comp.id}
        text={comp.text} 
        type={comp.type}
      />
    )), [components]);

  return (
    <div className={Styles.AIBox} style={style}>
      <div className={`${Styles.AIBoxMessageBox} overflow-none`} role="log" aria-live="polite">
        {components.length === 0 ? (
          <span className={Styles.AIBoxAIMessage}>
            <p>Hello, How can I assist you today?</p>
          </span>
        ) : (
          chatMessages
        )}
      </div>
      <div className={Styles.AIBoxInputBox}>
        <span
          style={{ display: aiLoading ? 'flex' : 'none' }}
          aria-hidden={!aiLoading}
          role="status"
          aria-label="AI is thinking">
          <p></p><p></p><p></p>
        </span>
        <input 
          type="text"
          placeholder="Type your message..." 
          value={inputText}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={aiLoading}
          aria-label="Chat input"/>
        <button 
          onClick={handleSendMessage} 
          disabled={aiLoading || !inputText.trim()}
          aria-label="Send message"
          type="button">
          <LuArrowUp />
        </button>
      </div>
    </div>
  );
});

const AdminPanel: React.FC<AdminPanelProps> = ({ admin, onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    onLogout();
  };
  const [tab, setTab] = useState<TabType>("createBlog");
  const [previewTab, setPreviewTab] = useState<PreviewTabType>("preview");
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>("");
  const [components, setComponents] = useState<ChatMessage[]>([]);
  const [blogContent, setBlogContent] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load blog content from localStorage on component mount
  useEffect(() => {
    const savedContent = loadBlogContentFromStorage();
    if (savedContent) {
      setBlogContent(savedContent);
    }
  }, []);

  // Save blog content to localStorage whenever it changes
  useEffect(() => {
    saveBlogContentToStorage(blogContent);
  }, [blogContent]);

  // Create blog tools with textarea reference
  const blogToolsList = createBlogToolsList(textareaRef);
  
  const generateText = useCallback(async (): Promise<void> => {
    if (!ai) {
      const errorMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: "API key not configured. Please check your environment variables.", 
        type: "ai",
        timestamp: new Date()
      };
      setComponents(prev => [...prev, errorMessage]);
      return;
    }
    try {
      setAiLoading(true);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: inputText,
      });
      const text = response.text;
      if (text) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text, 
          type: "ai", 
          timestamp: new Date()
        };
        setComponents(prev => [...prev, aiMessage]);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : "Something went wrong while generating content.";
      
      const aiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        text: errorMessage, 
        type: "ai",
        timestamp: new Date()
      };
      setComponents(prev => [...prev, aiMessage]);
    } finally {
      setAiLoading(false);
    }
  }, [inputText]);

  const handleSendMessage = useCallback((): void => {
    const trimmedInput = inputText.trim();
    if (trimmedInput && !aiLoading) {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        text: trimmedInput, 
        type: "user",
        timestamp: new Date()
      };
      setComponents(prev => [...prev, userMessage]);
      generateText();
      setInputText("");
    }
  }, [inputText, aiLoading, generateText]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    setInputText(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle blog content changes
  const handleBlogContentChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>): void => {
    setBlogContent(e.target.value);
  }, []);

  const createBlog = (): JSX.Element => (
    <div className={Styles.createBlog}>
      <div className={Styles.createBlogDiv}>
        <div className={Styles.blogTools} role="toolbar" aria-label="Blog formatting tools">
          {blogToolsList.map((tool, index) => (
            <button 
              key={`${tool.title}-${index}`} 
              onClick={tool.onClick} 
              title={tool.title}
              type="button"
              aria-label={tool.title}>
              {tool.icon}
            </button>
          ))}
        </div>
        <textarea 
          ref={textareaRef}
          className={Styles.blogCode} 
          placeholder="Start writing a blog..."
          aria-label="Blog content editor"
          value={blogContent}
          onChange={handleBlogContentChange}/>
      </div>
      <div className={Styles.createBlogDiv}>
        <div className={Styles.previewTabs} role="tablist" aria-label="Preview options">
          <button 
            className={previewTab === "preview" ? Styles.activePreviewTab : ""} 
            onClick={() => setPreviewTab("preview")}
            role="tab"
            aria-selected={previewTab === "preview"}
            aria-controls="preview-panel"
            type="button">
            Preview
          </button>
          <button 
            className={previewTab === "ai" ? Styles.activePreviewTab : ""} 
            onClick={() => setPreviewTab("ai")}
            role="tab"
            aria-selected={previewTab === "ai"}
            aria-controls="ai-panel"
            type="button">
            Use AI
          </button>
        </div>
        <PreviewBox 
          style={{ display: previewTab === "preview" ? 'flex' : 'none' }}
          content={blogContent}/>
        <AIBox 
          style={{ display: previewTab === "ai" ? 'flex' : 'none' }}
          components={components}
          aiLoading={aiLoading}
          inputText={inputText}
          handleInputChange={handleInputChange}
          handleKeyPress={handleKeyPress}
          handleSendMessage={handleSendMessage}/>
      </div>
    </div>
  );

  const renderTabContent = (): JSX.Element | null => {
    switch (tab) {
      case "createBlog":
        return createBlog();
      case "addBlog":
        return <div>All Blogs Content - Coming Soon</div>;
      case "analytics":
        return <div>Analytics Content - Coming Soon</div>;
      case "settings":
        return <div>Settings Content - Coming Soon</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <nav className={Styles.adminNav} role="banner">
        <Logo />
        <div className={Styles.adminImg}>
          <p>Admin Account</p>
          <img src="/avatar1.jpg" alt="Admin Avatar" />
        </div>
      </nav>
      <section role="main">
        <nav className={Styles.options} role="navigation" aria-label="Admin panel navigation">
          <button 
            className={tab === "createBlog" ? Styles.activeTab : ""} 
            onClick={() => setTab("createBlog")}
            type="button"
            aria-pressed={tab === "createBlog"}>
            <LuPencilLine /> Create Blog
          </button>
          <button 
            className={tab === "addBlog" ? Styles.activeTab : ""} 
            onClick={() => setTab("addBlog")}
            type="button"
            aria-pressed={tab === "addBlog"}>
            <LuFileText /> All Blogs
          </button>
          <button 
            className={tab === "analytics" ? Styles.activeTab : ""} 
            onClick={() => setTab("analytics")}
            type="button"
            aria-pressed={tab === "analytics"}>
            <LuChartLine /> Analytics
          </button>
          <button 
            className={tab === "settings" ? Styles.activeTab : ""} 
            onClick={() => setTab("settings")}
            type="button"
            aria-pressed={tab === "settings"}>
            <LuSettings /> Settings
          </button>
        </nav>
        <div className={Styles.product}>
          {renderTabContent()}
        </div>
      </section>
    </>
  );
};

export default AdminPanel;