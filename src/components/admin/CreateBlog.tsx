"use client";
import { ChangeEvent, KeyboardEvent, FC } from "react";
import BlogEditor from "./BlogEditor";
import PreviewTabs from "./PreviewTabs";
import PreviewBox from "./PreviewBox";
import AIBox from "./AIBox";
import { TabType, ChatMessage, PreviewTabType } from "@/types/admin";
import Styles from "@/app/admin/admin.module.css";
import { type User } from '@supabase/supabase-js'


interface CreateBlogProps {
  admin: User;
  blogId?: string | null; // Optional for editing existing blogs
  setBlogId: React.Dispatch<React.SetStateAction<string | null>>;
  blogTitle: string;
  setBlogTitle: React.Dispatch<React.SetStateAction<string>>;
  blogSeries: string | null;
  setBlogSeries: React.Dispatch<React.SetStateAction<string | null>>;
  blogTags: string[];
  setBlogTags: React.Dispatch<React.SetStateAction<string[]>>;
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
  admin,
  blogId,
  setBlogId,
  blogTitle,
  setBlogTitle,
  blogSeries,
  setBlogSeries,
  blogTags,
  setBlogTags,
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
        admin={admin}
        blogId={blogId}
        setBlogId={setBlogId}
        blogTitle={blogTitle}
        setBlogTitle={setBlogTitle}
        blogSeries={blogSeries}
        setBlogSeries={setBlogSeries}
        blogTags={blogTags}
        setBlogTags={setBlogTags}
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
          admin={admin}
          content={blogContent}
          blogTitle={blogTitle}
          setBlogTitle={setBlogTitle}
          blogSeries={blogSeries}
          setBlogSeries={setBlogSeries}
          blogTags={blogTags}
          setBlogTags={setBlogTags}
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
