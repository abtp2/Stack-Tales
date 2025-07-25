import React from 'react'

const AllBlogs = () => {
  
const fetchBlogData = async () => {
    if (!blogId) return;

    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('title, content, series_id')
        .eq('id', blogId)
        .single();

      if (error) throw error;
      
      if (data) {
        setBlogTitle(data.title);
        setBlogContent(data.content);
        setBlogSeries(data.series_id);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
      setMessage('Error loading blog data');
    }
  };
  
  
  return (
    <div></div>
  )
}

export default AllBlogs