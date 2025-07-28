import { useState, useEffect, FC, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Styles from "@/app/admin/admin.module.css";
import {LuExternalLink, LuPencil, LuTrash} from "react-icons/lu";
import { TabType } from "@/types/admin";

interface Admin {
  id: string;
  username: string;
  avatar_url: string;
}

interface Blog {
  id: string;
  title: string;
  content: string;
  series_id: string;
  author_id: string;
  created_at: string;
  admin?: Admin;
  admins?: Admin | Admin[]; // For raw data from Supabase
}

interface AllBlogsProps {
  blogId: string | null;
  setBlogId: React.Dispatch<React.SetStateAction<string | null>>;
  tab: TabType;
  setTab: React.Dispatch<React.SetStateAction<TabType>>;
}

const AllBlogs: FC<AllBlogsProps> = ({
  blogId,
  setBlogId,
  tab,
  setTab
}) => {
  const supabase = createClient();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [rangeFrom, setRangeFrom] = useState<number>(0);
  const [rangeTo, setRangeTo] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Blog[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [currentAdminId, setCurrentAdminId] = useState<string>("");
  const BLOGS_PER_PAGE = 6;
  
  const fetchCurrentAdminId = () =>{
    try{
      const session = localStorage.getItem('admin_session');
      if (session) {
        const sessionData = JSON.parse(session);
        setCurrentAdminId(sessionData.id);
      }
    } catch (error){
      console.error("Error fetching current admin ID");
    }
  }
  const fetchBlogNumber = async () => {
    try {
      setLoading(true);
      const { count, error } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      if (count !== null) {
        setTotalBlogs(count);
        const initialRangeTo = Math.min(BLOGS_PER_PAGE - 1, count - 1);
        setRangeTo(initialRangeTo);
        console.log("Total Blogs: " + count);
        console.log("Initial range: 0 to " + initialRangeTo);
        await fetchInitialBlogData(0, initialRangeTo, count);
      }
    } catch (error) {
      console.error('Error fetching number of blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialBlogData = async (from: number, to: number, totalCount: number) => {
    try {
      console.log(`Fetching initial blogs from ${from} to ${to}`);
      const { data, error } = await supabase
        .from('blogs')
        .select(`id, title, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (
            id,
            username,
            avatar_url
          )`)
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        console.log(`Fetched ${data.length} blogs`);
        const blogsWithAdmin = data.map(blog => ({
          ...blog,
          admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
        }));
        setBlogs(blogsWithAdmin);
        setHasMore((to + 1) < totalCount);
        console.log(`Has more blogs: ${(to + 1) < totalCount}`);
      }
    } catch (error) {
      console.error('Error fetching initial blogs:', error);
    }
  };

  const fetchBlogData = async (from: number, to: number) => {
    try {
      console.log(`Fetching blogs from ${from} to ${to}`);
      const { data, error } = await supabase
        .from('blogs')
        .select(`id, title, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (
            id,
            username,
            avatar_url
          )`)
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        console.log(`Fetched ${data.length} more blogs`);
        const blogsWithAdmin = data.map(blog => ({
          ...blog,
          admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
        }));
        setBlogs(prevBlogs => [...prevBlogs, ...blogsWithAdmin]);
        setHasMore(to < totalBlogs - 1);
        console.log(`Has more blogs after loading: ${to < totalBlogs - 1}`);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  // FIXED SEARCH FUNCTION
  const searchBlogs = async (term: string) => {
    if (!term.trim()) {
      // If search term is empty, exit search mode and show original blogs
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      setIsSearchMode(true);
      
      // Method 1: Search using two separate queries and combine results
      const searchTermFormatted = `%${term}%`;
      
      // Search by blog title
      const titleSearchPromise = supabase
        .from('blogs')
        .select(`id, title, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (
            id,
            username,
            avatar_url
          )`)
        .ilike('title', searchTermFormatted)
        .order('created_at', { ascending: false });

      // Search by admin username (using a different approach)
      const authorSearchPromise = supabase
        .from('blogs')
        .select(`id, title, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (
            id,
            username,
            avatar_url
          )`)
        .order('created_at', { ascending: false });

      // Execute both queries
      const [titleResults, authorResults] = await Promise.all([
        titleSearchPromise,
        authorSearchPromise
      ]);

      if (titleResults.error) throw titleResults.error;
      if (authorResults.error) throw authorResults.error;

      // Process title search results
      const titleBlogs = titleResults.data?.map(blog => ({
        ...blog,
        admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
      })) || [];

      // Process author search results and filter by username
      const authorBlogs = authorResults.data?.map(blog => ({
        ...blog,
        admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
      })).filter(blog => 
        blog.admin?.username?.toLowerCase().includes(term.toLowerCase())
      ) || [];

      // Combine results and remove duplicates
      const combinedResults = [...titleBlogs];
      
      authorBlogs.forEach(authorBlog => {
        if (!combinedResults.find(titleBlog => titleBlog.id === authorBlog.id)) {
          combinedResults.push(authorBlog);
        }
      });

      // Sort by created_at (newest first)
      combinedResults.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      console.log(`Found ${combinedResults.length} search results`);
      setSearchResults(combinedResults);
      
    } catch (error) {
      console.error('Error searching blogs:', error);
      // Fallback: search in client-side if database search fails
      try {
        console.log('Attempting client-side search fallback...');
        await clientSideSearch(term);
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setSearchResults([]);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // Fallback client-side search
  const clientSideSearch = async (term: string) => {
    // Get all blogs first
    const { data, error } = await supabase
      .from('blogs')
      .select(`id, title, content, series_id, author_id, created_at,
        admins!blogs_author_id_fkey (
          id,
          username,
          avatar_url
        )`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      // Transform and filter on client side
      const blogsWithAdmin = data.map(blog => ({
        ...blog,
        admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
      }));

      const filteredResults = blogsWithAdmin.filter(blog => {
        const titleMatch = blog.title.toLowerCase().includes(term.toLowerCase());
        const usernameMatch = blog.admin?.username?.toLowerCase().includes(term.toLowerCase()) || false;
        return titleMatch || usernameMatch;
      });

      console.log(`Client-side search found ${filteredResults.length} results`);
      setSearchResults(filteredResults);
    }
  };

  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchBlogs(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setIsSearchMode(false);
    setSearchResults([]);
  };

  const loadMoreBlogs = async () => {
    const nextRangeFrom = rangeTo + 1;
    const nextRangeTo = Math.min(nextRangeFrom + BLOGS_PER_PAGE - 1, totalBlogs - 1);
    
    console.log(`Loading more blogs from ${nextRangeFrom} to ${nextRangeTo}`);
    
    setRangeFrom(nextRangeFrom);
    setRangeTo(nextRangeTo);
    
    try {
      setLoading(true);
      await fetchBlogData(nextRangeFrom, nextRangeTo);
    } catch (error) {
      console.error('Error loading more blogs:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const EditBlog = (x)=> {
    try{
      setTab("createBlog");
      setBlogId(x);
    } catch (error){
      console.error("Error in editing blog");
    }
  };
  
  const DeleteBlog = async (x) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
      if (!confirmDelete) {
        alert("Blog deletion cancelled.");
        return;
      }
      const promptInput = window.prompt('Type "StackTales" to delete this blog permanently.');
      if (promptInput !== "StackTales") {
        alert('Blog not deleted. You must type "StackTales" exactly.');
        return;
      }
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', x);
      if (error) throw error;
      alert("Blog deleted successfully.");
      if (isSearchMode) {
        await searchBlogs(searchTerm);
      } else {
        setBlogs([]);
        setRangeFrom(0);
        setRangeTo(0);
        await fetchBlogNumber();
      }
    } catch (error) {
      console.error("Error in deleting blog:", error.message);
      alert("An error occurred while deleting the blog.");
    }
  };

  // Load blogs on component mount
  useEffect(() => {
    fetchBlogNumber();
    fetchCurrentAdminId();
  }, []);

  // Determine which blogs to display
  const displayBlogs = isSearchMode ? searchResults : blogs;
  const displayLoading = isSearchMode ? searchLoading : loading;
  const showViewMore = !isSearchMode && hasMore;

  return (
    <div className={`${Styles.AllBlogs} custom-scrollbar`}>
      {loading && blogs.length === 0 ? (
        <div className={Styles.AllBlogsLoading}>Loading blogs...</div>
      ) : (
        <>
          <form onSubmit={handleSearchSubmit} className={Styles.AllBlogsSearch}>
            <input 
              type="text" 
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className={Styles.AllBlogsSearchInput}
            />
            <button 
              type="submit" 
              disabled={searchLoading}
              className={Styles.AllBlogsSearchButton}
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
            {isSearchMode && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className={Styles.AllBlogsSearchClear}
              >
                Clear
              </button>
            )}
          </form>
          <h2 className={Styles.AllBlogsSearchResult}>
            {isSearchMode 
              ? `Search Results (${searchResults.length} found)` 
              : `Showing Blogs (${blogs.length} of ${totalBlogs})`
            }
          </h2>
          {displayLoading && displayBlogs.length === 0 ? (
            <div className={Styles.AllBlogsLoading}>
              {isSearchMode ? '' : 'Loading blogs...'}
            </div>
          ) : (
            <>
              <div className={Styles.AllBlogsList}>
                {displayBlogs.map((blog) => (
                  <div key={blog.id} className={Styles.AllBlogsCard}>
                    <div className={Styles.AllBlogsCardTools}>
                      <LuExternalLink className={Styles.AllBlogsCardOpen}/>
                      {(currentAdminId==blog.admin.id) && (
                      <>
                        <LuPencil onClick={()=>{EditBlog(blog.id)}}/>
                        <LuTrash onClick={()=>{DeleteBlog(blog.id)}}/>
                      </>
                      )}
                    </div>
                    
                    <span className={Styles.AllBlogsCardHeader}>
                      {blog.admin?.avatar_url && (
                        <img 
                          src={blog.admin.avatar_url} 
                          alt={blog.admin.username} 
                          className={Styles.AllBlogsAuthorAvatar}
                        />
                      )}
                      <h1>
                        {blog.admin?.username || 'Unknown Author'}
                        <p>
                          {new Date(blog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </h1>
                    </span>
                    <p className={Styles.AllBlogsCardTitle}>{blog.title}</p>
                  </div>
                ))}
              </div>
              
              {showViewMore && (
                <button 
                  className={Styles.AllBlogsViewMore} 
                  onClick={loadMoreBlogs} 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'View More'}
                </button>
              )}
            </>
          )}
        </>
      )}
      
      {displayBlogs.length === 0 && !displayLoading && (
        <p className={Styles.AllBlogsNoBlogs}>
          {isSearchMode ? `No blogs found for "${searchTerm}"` : 'No blogs found'}
        </p>
      )}
    </div>
  );
};

export default AllBlogs;