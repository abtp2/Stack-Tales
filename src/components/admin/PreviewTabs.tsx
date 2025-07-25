"use client";
import { PreviewTabType } from "@/types/admin";
import Styles from "@/app/admin/admin.module.css";

interface PreviewTabsProps {
  activeTab: PreviewTabType;
  onTabChange: (tab: PreviewTabType) => void;
}

const PreviewTabs: React.FC<PreviewTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className={Styles.previewTabs} role="tablist" aria-label="Preview options">
      <button 
        className={activeTab === "preview" ? Styles.activePreviewTab : ""} 
        onClick={() => onTabChange("preview")}
        role="tab"
        aria-selected={activeTab === "preview"}
        aria-controls="preview-panel"
        type="button">
        Preview
      </button>
      <button 
        className={activeTab === "ai" ? Styles.activePreviewTab : ""} 
        onClick={() => onTabChange("ai")}
        role="tab"
        aria-selected={activeTab === "ai"}
        aria-controls="ai-panel"
        type="button">
        Use AI
      </button>
    </div>
  );
};

export default PreviewTabs;