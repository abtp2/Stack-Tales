const BLOG_CONTENT_STORAGE_KEY = 'admin_blog_content';

export interface Blog {
  id: string;
  title: string;
  content: string;
  series_id: string | null;
  tags: string[];
}

export const loadBlogContentFromStorage = (): Blog | null => {
  if (typeof window === 'undefined') return null;
  try {
    const savedContent = localStorage.getItem(BLOG_CONTENT_STORAGE_KEY);
    return savedContent ? JSON.parse(savedContent) as Blog : null;
  } catch (error) {
    console.warn('Error loading blog content from localStorage:', error);
    return null;
  }
};

export const saveBlogContentToStorage = (blog: Blog): void => {
  if (typeof window === 'undefined') return;
  try {
    const json = JSON.stringify(blog);
    localStorage.setItem(BLOG_CONTENT_STORAGE_KEY, json);
  } catch (error) {
    console.warn('Error saving blog content to localStorage:', error);
  }
};


export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  } as T;
}