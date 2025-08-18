import Navbar from "@/components/layout/Navbar";
import BlogClient from "./BlogClient";
interface BlogProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPage({ params }: BlogProps) {
  const { slug } = await params;
  
  return (
    <div style={{paddingTop:'65px'}}>
      <Navbar />
      <BlogClient slug={slug} />
    </div>
  );
}