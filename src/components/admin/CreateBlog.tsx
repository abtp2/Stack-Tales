"use client";
import { ChangeEvent, KeyboardEvent, FC } from "react";
import BlogEditor from "./BlogEditor";
import PreviewTabs from "./PreviewTabs";
import PreviewBox from "./PreviewBox";
import AIBox from "./AIBox";
import { ChatMessage, PreviewTabType } from "@/types/admin";
import Styles from "@/app/admin/admin.module.css";

interface CreateBlogProps {
  blogId?: string | null; // Optional for editing existing blogs
  setBlogId: React.Dispatch<React.SetStateAction<string | null>>;
  blogTitle: string;
  setBlogTitle: React.Dispatch<React.SetStateAction<string>>;
  blogSeries: string | null;
  setBlogSeries: React.Dispatch<React.SetStateAction<string | null>>;
  blogContent: string;
  setBlogContent: React.Dispatch<React.SetStateAction<string>>;
  previewTab: PreviewTabType;
  onPreviewTabChange: (tab: PreviewTabType) => void;
  components: ChatMessage[];
  aiLoading: boolean;
  inputText: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: () => void;
}

const CreateBlog: FC<CreateBlogProps> = ({
  blogId,
  setBlogId,
  blogTitle,
  setBlogTitle,
  blogSeries,
  setBlogSeries,
  blogContent, 
  setBlogContent,
  previewTab,
  onPreviewTabChange,
  components,
  aiLoading,
  inputText,
  handleInputChange,
  handleKeyPress,
  handleSendMessage,
}) => {
  return (
    <div className={Styles.createBlog}>
      <BlogEditor 
        blogId={blogId}
        setBlogId={setBlogId}
        blogTitle={blogTitle}
        setBlogTitle={setBlogTitle}
        blogSeries={blogSeries}
        setBlogSeries={setBlogSeries}
        blogContent={blogContent}
        setBlogContent={setBlogContent}
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
