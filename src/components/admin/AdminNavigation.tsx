"use client";
import { LuPencilLine, LuFileText, LuChartLine, LuImageUp, LuSettings } from "react-icons/lu";
import { TabType } from "@/types/admin";
import Styles from "@/app/admin/admin.module.css";

interface AdminNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className={Styles.options} role="navigation" aria-label="Admin panel navigation">
      <button 
        className={activeTab === "createBlog" ? Styles.activeTab : ""} 
        onClick={() => onTabChange("createBlog")}
        type="button"
        aria-pressed={activeTab === "createBlog"}>
        <LuPencilLine /> Create Blog
      </button>
      <button 
        className={activeTab === "addBlog" ? Styles.activeTab : ""} 
        onClick={() => onTabChange("addBlog")}
        type="button"
        aria-pressed={activeTab === "addBlog"}>
        <LuFileText /> All Blogs
      </button>
      <button 
        className={activeTab === "analytics" ? Styles.activeTab : ""} 
        onClick={() => onTabChange("analytics")}
        type="button"
        aria-pressed={activeTab === "analytics"}>
        <LuChartLine /> Analytics
      </button>
      <button 
        className={activeTab === "mediaUpload" ? Styles.activeTab : ""} 
        onClick={() => onTabChange("mediaUpload")}
        type="button"
        aria-pressed={activeTab === "mediaUpload"}>
        <LuImageUp /> Media Upload
      </button>
      <button 
        className={activeTab === "settings" ? Styles.activeTab : ""} 
        onClick={() => onTabChange("settings")}
        type="button"
        aria-pressed={activeTab === "settings"}>
        <LuSettings /> Settings
      </button>
    </nav>
  );
};

export default AdminNavigation;