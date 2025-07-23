import Navbar from "@/components/layout/Navbar";
import RoughNotation from "@/components/layout/RoughNotation";
import LatestBlogs from "@/components/layout/LatestBlogs";
import TrendingTags from "@/components/layout/TrendingTags";
import FeaturedSeries from "@/components/layout/FeaturedSeries";
import Styles from "./main.module.css";
import {LuSparkles, LuArrowRight, LuCode, LuFileText, LuWrench, LuActivity, LuUsers} from "react-icons/lu";

export default function Home(){
const heroCards = [
  {
    icon: <LuCode />,
    title: "Full-Stack Tutorials",
    description: "Learn frontend to backend with real-world examples and easy-to-follow steps.",
    cta: "Start Learning",
    link: "/tutorials"
  },
  {
    icon: <LuFileText />,
    title: "Latest Dev Articles",
    description: "Stay updated with coding trends, best practices, and community-curated blogs.",
    cta: "Read Blogs",
    link: "/blogs"
  },
  {
    icon: <LuWrench />,
    title: "Dev Tools & Kits",
    description: "Discover top tools, code snippets, and libraries to boost your workflow.",
    cta: "Browse Tools",
    link: "/resources"
  },
  {
    icon: <LuActivity />,
    title: "Coding Challenges",
    description: "Sharpen your skills with problems, quizzes, and hands-on coding tasks.",
    cta: "Solve Now",
    link: "/challenges"
  },
  {
    icon: <LuUsers />,
    title: "Community Support",
    description: "Join discussions, ask questions, and share knowledge with fellow devs.",
    cta: "Join Now",
    link: "/community"
  }
];


  return (
    <>
    <Navbar/>
    <div className={Styles.hero}>
      <section>
        <p><LuSparkles className={Styles.sparkleIcon}/> Latest Dev Blogs</p>
        <h1>DEMYSTIFYING <span>{"<CODE/>"} </span> AND STACKS WITH <RoughNotation>SIMPLICITY</RoughNotation></h1>
        <div className={Styles.heroAvatars}>
          {[...Array(6)].map((_, i) => (
            <span key={i}>
              <img src={`/avatar${i + 1}.jpg`} alt={`Avatar ${i + 1}`} />
            </span>
          ))}
          <a href="">Join Community <LuArrowRight/></a>
        </div>
        <div className={`${Styles.heroCardsDiv} overflow-none`}>
          {heroCards.map((card, index)=>(
            <div className={Styles.heroCard} key={index}>
              <span>{card.icon} <h2>{card.title}</h2></span>
              <p>{card.description}</p>
              <button>{card.cta} <LuArrowRight/></button>
            </div>
            ))}
        </div>
      </section>
    </div>
    <section className={Styles.secondSection}>
        <LatestBlogs/>
        <div className={Styles.secondSectionDiv}>
          <TrendingTags/>
          <FeaturedSeries/>
        </div>
    </section>
    </>
  );
}
