import Styles from "@/components/layout/layout.module.css";

const TrendingTagsList = [
  "#JavaScript",
  "#ReactJS",
  "#NextJS",
  "#TypeScript",
  "#WebDevelopment",
  "#Frontend",
  "#Backend",
  "#FullStack",
  "#NodeJS",
  "#OpenSource",
  "#CSSTricks",
  "#TailwindCSS"
];

const TrendingTags = () => {
  return (
    <div className={Styles.trendingTags}>
      <h1 className={Styles.sectionHeading}>Trending Tags</h1>
      <span>
        {TrendingTagsList.map((tag,index) =>(
        <p key={index}>{tag}</p>
        ))}
      </span>
    </div>
  )
}

export default TrendingTags;