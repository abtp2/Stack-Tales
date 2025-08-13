import Navbar from "@/components/layout/Navbar";
import BlogClient from "./BlogClient";
import Footer from "@/components/layout/Footer";
interface BlogProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPage({ params }: BlogProps) {
  const { slug } = await params;
  
  return (
    <>
      <Navbar />
      <BlogClient slug={slug} />
      <Footer/>
    </>
  );
}