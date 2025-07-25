export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ChatMessage {
  readonly id: string;
  readonly text: string;
  readonly type: "user" | "ai";
  readonly timestamp: Date;
}

export type TabType = "createBlog" | "addBlog" | "analytics" | "settings";
export type PreviewTabType = "preview" | "ai";
