import Styles from "@/components/layout/layout.module.css";

interface LatestBlogCardProps {
  author: string;
  date: string;
  title: string;
  description: string;
  authorImage: string;
}

const LatestBlogCard = ({ author, date, title, description, authorImage }: LatestBlogCardProps) => {
  return (
    <div className={Styles.latestBlogCard}>
      <span>
        <img src={authorImage} alt={author} />
        <h1>
          {author} <p>{date}</p>
        </h1>
      </span>
      <h2>{title}</h2>
      <h3>{description}</h3>
      <button>Read More</button>
    </div>
  );
};

export default LatestBlogCard;