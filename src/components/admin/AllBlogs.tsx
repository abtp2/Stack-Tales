import { useState, useEffect, FC, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import Styles from "@/app/admin/admin.module.css";
import { LuExternalLink, LuPencil, LuTrash } from "react-icons/lu";
import { TabType } from "@/types/admin";
import { type User } from '@supabase/supabase-js'
import { useRouter } from "next/navigation";

interface AdminRef {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

interface Blog {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  series_id: string | null;
  author_id: string | null;
  created_at: string;
  admin?: AdminRef;
  admins?: AdminRef | AdminRef[];
}

interface AllBlogsProps {
  blogId: string | null;
  setBlogId: React.Dispatch<React.SetStateAction<string | null>>;
  tab: TabType;
  setTab: React.Dispatch<React.SetStateAction<TabType>>;
  admin: User;
}

const AllBlogs: FC<AllBlogsProps> = ({
  blogId,
  setBlogId,
  tab,
  setTab,
  admin
}) => {
  const supabase = createClient();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalBlogs, setTotalBlogs] = useState<number>(0);
  const [rangeFrom, setRangeFrom] = useState<number>(0);
  const [rangeTo, setRangeTo] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Blog[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const router = useRouter();
  useEffect(() => {
    router.prefetch('/blog');
  }, [router])
  
  
  const BLOGS_PER_PAGE = 6;

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
      const { data, error } = await supabase
        .from('blogs')
        .select(`id, title, slug, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (
            id,
            username,
            avatar_url
          )`)
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const blogsWithAdmin: Blog[] = data.map((blog: any) => ({
          ...blog,
          admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
        })) as Blog[];
        setBlogs(blogsWithAdmin);
        setHasMore((to + 1) < totalCount);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const fetchBlogData = async (from: number, to: number) => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`id, title, slug, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (
            id,
            username,
            avatar_url
          )`)
        .range(from, to)
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const blogsWithAdmin: Blog[] = data.map((blog: any) => ({
          ...blog,
          admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
        })) as Blog[];
        setBlogs((prev) => [...prev, ...blogsWithAdmin]);
        setHasMore(to < totalBlogs - 1);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const searchBlogs = async (term: string) => {
    if (!term.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      setIsSearchMode(true);

      const searchTermFormatted = `%${term}%`;

      const [titleRes, authorRes] = await Promise.all([
        supabase.from('blogs').select(`id, title, slug, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (id, username, avatar_url)`).ilike('title', searchTermFormatted),
        supabase.from('blogs').select(`id, title, slug, content, series_id, author_id, created_at,
          admins!blogs_author_id_fkey (id, username, avatar_url)`)
      ]);

      if (titleRes.error) throw titleRes.error;
      if (authorRes.error) throw authorRes.error;

      const titleBlogs: Blog[] = (titleRes.data?.map((blog: any) => ({
        ...blog,
        admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
      })) as Blog[]) || [];

      const authorBlogs: Blog[] = (authorRes.data?.map((blog: any) => ({
        ...blog,
        admin: Array.isArray(blog.admins) ? blog.admins[0] : blog.admins
      })) as Blog[]).filter((blog: Blog) =>
        blog.admin?.username?.toLowerCase().includes(term.toLowerCase())
      ) || [];

      const combined: Blog[] = [...titleBlogs];
      authorBlogs.forEach(b => {
        if (!combined.find(existing => existing.id === b.id)) {
          combined.push(b);
        }
      });

      combined.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setSearchResults(combined);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchBlogs(searchTerm);
  };

  const EditBlog = (id: string) => {
    setTab("createBlog");
    setBlogId(id);
  };

  const DeleteBlog = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    const input = window.prompt('Type "StackTales" to confirm');
    if (input !== "StackTales") return alert("Incorrect confirmation");

    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) return alert("Error deleting blog");

    if (isSearchMode) {
      await searchBlogs(searchTerm);
    } else {
      setBlogs([]);
      setRangeFrom(0);
      setRangeTo(0);
      await fetchBlogNumber();
    }
  };

  useEffect(() => {
    fetchBlogNumber();
  }, []);

  const displayBlogs = isSearchMode ? searchResults : blogs;
  const showViewMore = !isSearchMode && hasMore;

  return (
    <div className={`${Styles.AllBlogs} custom-scrollbar`}>
      <form onSubmit={handleSearchSubmit} className={Styles.AllBlogsSearch}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={Styles.AllBlogsSearchInput}
        />
        <button type="submit" className={Styles.AllBlogsSearchButton}>
          {searchLoading ? "Searching..." : "Search"}
        </button>
        {isSearchMode && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setIsSearchMode(false);
              setSearchResults([]);
            }}
            className={Styles.AllBlogsSearchClear}
          >
            Clear
          </button>
        )}
      </form>

      <h2 className={Styles.AllBlogsSearchResult}>
        {isSearchMode
          ? `Search Results (${searchResults.length})`
          : `Showing Blogs (${blogs.length} of ${totalBlogs})`}
      </h2>

      <div className={Styles.AllBlogsList}>
        {displayBlogs.map((blog) => (
          <div key={blog.id} className={Styles.AllBlogsCard}>
            <div className={Styles.AllBlogsCardTools}>
              <LuExternalLink onClick={()=>{router.push(`/blog/${blog.slug}`);}}/>
              {admin?.id === blog.admin?.id && (
                <>
                  <LuPencil onClick={() => EditBlog(blog.id)} />
                  <LuTrash onClick={() => DeleteBlog(blog.id)} />
                </>
              )}
            </div>
            <span className={Styles.AllBlogsCardHeader}>
              {blog.admin?.avatar_url && (
                <img
                  src={blog.admin.avatar_url ?? "/avatar.jpg"}
                  alt={blog.admin.username ?? "Author avatar"}
                  className={Styles.AllBlogsAuthorAvatar}
                />
              )}
              <h1>
                {blog.admin?.username || "Unknown Author"}
                <p>
                  {new Date(blog.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
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
          onClick={async () => {
            const nextFrom = rangeTo + 1;
            const nextTo = Math.min(nextFrom + BLOGS_PER_PAGE - 1, totalBlogs - 1);
            setRangeFrom(nextFrom);
            setRangeTo(nextTo);
            await fetchBlogData(nextFrom, nextTo);
          }}
        >
          {loading ? "Loading..." : "View More"}
        </button>
      )}
    </div>
  );
};

export default AllBlogs;