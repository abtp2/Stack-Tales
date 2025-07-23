"use client";
import Logo from "@/components/layout/Logo";
import Styles from "@/app/admin/admin.module.css";
import Code from "@/components/layout/Code";
import { LuPencilLine,LuFileText,LuChartLine,LuSettings,LuArrowUp,  LuHeading1,LuHeading2,LuHeading3,LuBold,LuPilcrow,LuCode,LuList,LuListOrdered,LuQuote } from "react-icons/lu";
import {useState, useCallback} from "react";
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY });

const blogToolsList = [
  {
    title: "Heading 1",
    icon: <LuHeading1 />,
    onClick: () => console.log("Insert <h1>")
  },
  {
    title: "Heading 2",
    icon: <LuHeading2 />,
    onClick: () => console.log("Insert <h2>")
  },
  {
    title: "Heading 3",
    icon: <LuHeading3 />,
    onClick: () => console.log("Insert <h3>")
  },
  {
    title: "Bold",
    icon: <LuBold />,
    onClick: () => console.log("Toggle bold")
  },
  {
    title: "Paragraph",
    icon: <LuPilcrow />,
    onClick: () => console.log("Insert <p>")
  },
  {
    title: "Code Block",
    icon: <LuCode />,
    onClick: () => console.log("Insert <code>")
  },
  {
    title: "Unordered List",
    icon: <LuList />,
    onClick: () => console.log("Insert <ul>")
  },
  {
    title: "Ordered List",
    icon: <LuListOrdered />,
    onClick: () => console.log("Insert <ol>")
  },
  {
    title: "Blockquote",
    icon: <LuQuote />,
    onClick: () => console.log("Insert <blockquote>")
  }
];

const ChatMessage = ({text, type}) => (
  <span className={type === "user" ? Styles.AIBoxUserMessage : Styles.AIBoxAIMessage}>
    {type === "user" ? <p>{text}</p> : 
      <Markdown
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && match ? (
              <Code language={language}>
                {String(children).replace(/\n$/, '')}
              </Code>
            ) : (
              <code style={{padding:'0 !important', background:'var(--fade)'}} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {text}
      </Markdown>
    }
  </span>
);

const PreviewBox = ({style}) => (
  <div className={Styles.previewBox} style={style}>
    <h1>previewBox</h1>
  </div>
);

const AIBox = ({style, components, aiLoading, inputText, handleInputChange, handleKeyPress, handleSendMessage}) => (
  <div className={Styles.AIBox} style={style}>
    <div className={`${Styles.AIBoxMessageBox} overflow-none`}>
      {components.length === 0 ? (
        <span className={Styles.AIBoxAIMessage}>
          <p>Hello, How can I assist you today?</p>
        </span>
        ) : (
        components.map((comp, index) => (
          <ChatMessage key={index} text={comp.text} type={comp.type}/>
        ))
      )}
    </div>
    <span className={Styles.AIBoxInputBox}>
      <span style={aiLoading ? {display:'flex'} : {display:'none'}}>
        <p></p><p></p><p></p>
      </span>
      <input 
        placeholder="Type your message..." 
        value={inputText}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={aiLoading}
      />
      <button 
        onClick={handleSendMessage} 
        disabled={aiLoading || !inputText.trim()}
      >
        <LuArrowUp/>
      </button>
    </span>
  </div>
);
  
const AdminPanel = () => {
  const [tab, setTab] = useState("createBlog");
  const [previewTab, setPreviewTab] = useState("ai");
  const [aiLoading, setAiLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [components, setComponents] = useState([]);

  const generateText = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY) {
      setComponents(prev => [...prev, {
        text: "API key not configured. Please check your environment variables.", 
        type: "ai"
      }]);
      return;
    }
    try {
      setAiLoading(true);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: inputText,
      });
      const text = response.text;
      setComponents(prev => [...prev, {text, type: "ai"}]);
    } catch (error) {
      console.error("Error:", error);
      setComponents(prev => [...prev, {text: "Something went wrong.", type: "ai"}]);
    } finally {
      setAiLoading(false);
    }
  }, [inputText]);

  const handleSendMessage = useCallback(() => {
    if (inputText.trim() && !aiLoading) {
      setComponents(prev => [...prev, {text: inputText, type: "user"}]);
      generateText();
      setInputText("");
    }
  }, [inputText, aiLoading, generateText]);

  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  function createBlog() {
    return (
      <div className={Styles.createBlog}>
        <div className={Styles.createBlogDiv}>
          <div className={Styles.blogTools}>
            {blogToolsList.map((tool, index) => (
              <button key={index} onClick={tool.onClick} title={tool.title}>
                {tool.icon}
              </button>
            ))}
          </div>
          <textarea className={Styles.blogCode} placeholder="Start writing a blog..."/>
        </div>
        <div className={Styles.createBlogDiv}>
          <div className={Styles.previewTabs}>
            <button 
              className={previewTab === "preview" ? Styles.activePreviewTab : ""} 
              onClick={() => setPreviewTab("preview")}
            >
              Preview
            </button>
            <button 
              className={previewTab === "ai" ? Styles.activePreviewTab : ""} 
              onClick={() => setPreviewTab("ai")}
            >
              use AI
            </button>
          </div>
          <PreviewBox style={previewTab === "preview" ? {display:'flex'} : {display:'none'}}/>
          <AIBox 
            style={previewTab === "ai" ? {display:'flex'} : {display:'none'}}
            components={components}
            aiLoading={aiLoading}
            inputText={inputText}
            handleInputChange={handleInputChange}
            handleKeyPress={handleKeyPress}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={Styles.adminNav}>
        <Logo/>
        <div className={Styles.adminImg}>
          <p>Admin Account</p>
          <img src="/avatar1.jpg" alt="Admin Avatar"/>
        </div>
      </div>
      <section>
        <div className={Styles.options}>
          <p className={tab === "createBlog" ? Styles.activeTab : ""} onClick={() => setTab("createBlog")}>
            <LuPencilLine/> Create Blog
          </p>
          <p className={tab === "addBlog" ? Styles.activeTab : ""} onClick={() => setTab("addBlog")}>
            <LuFileText/> All Blogs
          </p>
          <p className={tab === "analytics" ? Styles.activeTab : ""} onClick={() => setTab("analytics")}>
            <LuChartLine/> Analytics
          </p>
          <p className={tab === "settings" ? Styles.activeTab : ""} onClick={() => setTab("settings")}>
            <LuSettings/> Settings
          </p>
        </div>
        <div className={Styles.product}>
          {(tab === "createBlog") && createBlog()}
          {/* Add other tab content here */}
        </div>
      </section>
    </>
  );
}

export default AdminPanel;