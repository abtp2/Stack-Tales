"use client";
import { ChangeEvent, KeyboardEvent } from "react";
import BlogEditor from "./BlogEditor";
import PreviewTabs from "./PreviewTabs";
import PreviewBox from "./PreviewBox";
import AIBox from "./AIBox";
import { ChatMessage, PreviewTabType } from "@/types/admin";
import Styles from "@/app/admin/admin.module.css";

interface CreateBlogProps {
  blogContent: string;
  setBlogContent: React.Dispatch<React.SetStateAction<string>>;
  onBlogContentChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  previewTab: PreviewTabType;
  onPreviewTabChange: (tab: PreviewTabType) => void;
  components: ChatMessage[];
  aiLoading: boolean;
  inputText: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
}

const CreateBlog: React.FC<CreateBlogProps> = ({
  blogContent,
  setBlogContent,
  onBlogContentChange,
  previewTab,
  onPreviewTabChange,
  components,
  aiLoading,
  inputText,
  handleInputChange,
  handleKeyPress,
  handleSendMessage
}) => {
  return (
    <div className={Styles.createBlog}>
      <BlogEditor 
        blogContent={blogContent}
        setBlogContent={setBlogContent}
        onContentChange={onBlogContentChange}
      />
      <div className={Styles.createBlogDiv}>
        <PreviewTabs 
          activeTab={previewTab}
          onTabChange={onPreviewTabChange}
        />
        <PreviewBox 
          style={{ display: previewTab === "preview" ? 'flex' : 'none' }}
          content={blogContent}
        />
        <AIBox 
          style={{ display: previewTab === "ai" ? 'flex' : 'none' }}
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
};

export default CreateBlog;
