import Navbar from "@/components/layout/Navbar";
import BlogClient from "./BlogClient";

interface BlogProps {
  params: {
    slug: string;
  };
}

export default async function BlogPage({ params }: BlogProps) {
  return (
    <>
      <Navbar />
      <BlogClient slug={params.slug} />
    </>
  );
}