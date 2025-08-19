"use client";
import Logo from "@/components/layout/Logo";
import Styles from "@/components/layout/layout.module.css";
import { createClient } from "@/lib/supabase/client";
import { LuMenu, LuSearch, LuX, LuSun, LuMoon } from "react-icons/lu";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import {useTheme} from "@/app/theme-provider";
interface Blog {
  title: string;
  slug: string;
}

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [sidebar, setSidebar] = useState<boolean>(false);
  const [searchBox, setSearchBox] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/admin');
    router.prefetch('/blog');
  }, [router])

  // Default suggestions with their own slugs
  const defaultSuggestions: Blog[] = [
    { title: "Getting Started with React", slug: "getting-started-react" },
    { title: "Next.js Best Practices", slug: "nextjs-best-practices" },
    { title: "Supabase Tutorial", slug: "supabase-tutorial" },
    { title: "TypeScript Tips", slug: "typescript-tips" },
  ];

  // Fetch blogs from Supabase
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("title, slug")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching blogs:", error);
        // Use default suggestions as fallback
        setBlogs(defaultSuggestions);
        setFilteredBlogs(defaultSuggestions);
      } else {
        const normalized: Blog[] = (data || [])
          .filter((row): row is Blog => typeof row?.title === 'string' && typeof row?.slug === 'string' && row.slug.trim().length > 0)
          .map(({ title, slug }) => ({ title, slug }));
        setBlogs(normalized);
        setFilteredBlogs(normalized);
      }
    } catch (error) {
      console.error("Error:", error);
      // Use default suggestions as fallback
      setBlogs(defaultSuggestions);
      setFilteredBlogs(defaultSuggestions);
    } finally {
      setLoading(false);
    }
  };

  // Filter blogs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show all blogs (or default suggestions if no blogs) when search is empty
      setFilteredBlogs(blogs.length > 0 ? blogs : defaultSuggestions);
    } else {
      const allBlogs = blogs.length > 0 ? blogs : defaultSuggestions;
      const filtered = allBlogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBlogs(filtered);
    }
  }, [searchQuery, blogs]);

  // Fetch blogs when component mounts
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Focus input when searchBox opens
  useEffect(() => {
    if (searchBox && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchBox]);

  // Close searchBox on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setSearchBox(false);
        setSearchQuery(""); // Clear search when closing
      }
    };

    if (searchBox) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchBox]);

  // Handle blog selection and navigation
  const handleBlogSelect = (slug: string) => {
    router.push(`/blog/${slug}`);
    setSearchBox(false);
    setSearchQuery("");
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={Styles.nav}>
      <section>
        <Logo />
        <span>
          <div className={Styles.sidebar} style={sidebar ? { left: "0" } : { left: "-100%" }}>
            <LuX onClick={() => setSidebar(false)} />
            <Link href="">Courses</Link>
            <Link href="">Categories</Link>
            <Link href="">Certificate</Link>
            <Link href="">About</Link>
            <Link href="/admin">Admin</Link>
          </div>
          <div className={Styles.themeIcon} onClick={()=>{setTheme(theme === 'light' ? 'dark' : 'light')}}>{theme=="light" ? (<LuMoon/>) : (<LuSun/>)}</div>
          <LuSearch
            className={Styles.searchIcon}
            onClick={() => setSearchBox((prev) => !prev)}
          />
          {searchBox && (
            <div className={Styles.searchBox} ref={searchBoxRef}>
              <div className={Styles.searchBoxInput}>
                <LuSearch />
                <input
                  ref={inputRef}
                  placeholder="Search Blogs..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className={`${Styles.searchBoxResult} custom-scrollbar`}>
                {loading ? (
                  <span><p style={{ opacity: 0.6, fontStyle: "italic" }}>Loading...</p></span>
                ) : filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog, index) => (
                  <span key={`${blog.slug}-${index}`}>
                    <p onClick={() => handleBlogSelect(blog.slug)} style={{ cursor: "pointer" }}>
                      {blog.title}
                    </p></span>
                  ))
                ) : (
                  <span><p style={{ opacity: 0.6, fontStyle: "italic" }}>
                    No blogs found
                  </p></span>
                )}
              </div>
            </div>
          )}
          <LuMenu
            className={Styles.menuIcon}
            onClick={() => setSidebar(true)}
          />
        </span>
      </section>
    </div>
  );
};

export default Navbar;