const BLOG_CONTENT_STORAGE_KEY = 'admin_blog_content';

export const loadBlogContentFromStorage = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const savedContent = localStorage.getItem(BLOG_CONTENT_STORAGE_KEY);
    return savedContent || '';
  } catch (error) {
    console.warn('Error loading blog content from localStorage:', error);
    return '';
  }
};

export const saveBlogContentToStorage = (content: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BLOG_CONTENT_STORAGE_KEY, content);
  } catch (error) {
    console.warn('Error saving blog content to localStorage:', error);
  }
};