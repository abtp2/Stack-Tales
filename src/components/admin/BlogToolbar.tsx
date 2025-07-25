"use client";
import { ReactNode } from "react";
import { 
  LuHeading1, LuHeading2, LuHeading3, LuBold, LuPilcrow, 
  LuCode, LuList, LuListOrdered, LuQuote 
} from "react-icons/lu";
import { insertText, insertHtmlList } from "@/utils/textEditor";
import Styles from "@/app/admin/admin.module.css";

interface BlogTool {
  readonly title: string;
  readonly icon: ReactNode;
  readonly onClick: () => void;
}

interface BlogToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const BlogToolbar: React.FC<BlogToolbarProps> = ({ textareaRef }) => {
  const blogToolsList: readonly BlogTool[] = [
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

  return (
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
  );
};

export default BlogToolbar;
