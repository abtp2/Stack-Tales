import Styles from "@/components/layout/layout.module.css";
import LatestBlogCard from "@/components/layout/LatestBlogCard";
const latestBlogsList = [
  {
    author: "Ashutosh Pandey",
    photo: "https://avatar.iran.liara.run/public/1",
    date: "15 June 2025",
    title: "Mastering React Hooks",
    description: "Explore how useEffect, useState, and custom hooks can level up your React components."
  },
  {
    author: "Sneha Kapoor",
    photo: "https://avatar.iran.liara.run/public/2",
    date: "13 June 2025",
    title: "TypeScript with React: Best Practices",
    description: "A beginner-friendly guide to integrating TypeScript into your React projects efficiently."
  },
  {
    author: "Rahul Verma",
    photo: "https://avatar.iran.liara.run/public/3",
    date: "10 June 2025",
    title: "React Performance Optimization Techniques",
    description: "Learn practical tips like memoization, lazy loading, and avoiding re-renders in React apps."
  },
  {
    author: "Priya Sharma",
    photo: "https://avatar.iran.liara.run/public/4",
    date: "08 June 2025",
    title: "Building a Blog with Next.js 15",
    description: "Discover how to create a high-performance, SEO-friendly blog using Next.js and Tailwind CSS."
  },
  {
    author: "Aman Mehra",
    photo: "https://avatar.iran.liara.run/public/5",
    date: "06 June 2025",
    title: "Demystifying Redux in 2025",
    description: "Understand Redux fundamentals and whether you still need it in the modern React ecosystem."
  }
];


const LatestBlogs = () => {
  return(
    <div className={Styles.latestblogs}>
      <h1 className={Styles.sectionHeading}>Latest Blogs</h1>
      {latestBlogsList.map((element,index) =>(
        <LatestBlogCard key={index} author={element.author} date={element.date} title={element.title} description={element.description} authorImage={element.photo}/>
      ))}
    </div>
  );
}

export default LatestBlogs;