import Styles from "@/components/layout/layout.module.css";
import {LuMousePointer2} from "react-icons/lu";

const featuredSeriesList = [
  "Frontend Fundamentals",
  "Git & GitHub Basics",
  "React for Developers",
  "Backend with Node.js + Express",
  "Fullstack App with MERN Stack",
  "Next.js Crash Course",
  "TypeScript for JavaScript Devs",
];

const FeaturedSeries = () => {
  return(
    <div className={Styles.featuredSeries}>
      <h1 className={Styles.sectionHeading}>Featured Series</h1>
      <span>
        {featuredSeriesList.map((series, index) =>(
        <p key={index}><LuMousePointer2/> {series}</p>
        ))}
      </span>
    </div>
  );
}

export default FeaturedSeries;