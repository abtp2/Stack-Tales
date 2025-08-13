import React from 'react';
import Styles from "@/app/main.module.css";
import Logo from './Logo';


const Footer = () => {
  return (
    <section className={Styles.footer}>
        <Logo/>
        <div className={Styles.footerLinks}>
            <div className={Styles.footerLinksDiv}>
                <h1>Learning Resources</h1>
                <p><a href="#">ReactJS</a></p>
                <p><a href="#">Javascript</a></p>
                <p><a href="#">NodeJS</a></p>
                <p><a href="#">TailwindCSS</a></p>
                <p><a href="#">ExpressJS</a></p>
            </div>
            <div className={Styles.footerLinksDiv}>
                <h1>Community Links</h1>
                <p><a href="#">Github</a></p>
                <p><a href="#">LinkedIn</a></p>
                <p><a href="#">Twitter</a></p>
            </div>
            <div className={Styles.footerLinksDiv}>
                <h1>Learning Resources</h1>
                <p><a href="#">ReactJS</a></p>
                <p><a href="#">Javascript</a></p>
                <p><a href="#">NodeJS</a></p>
                <p><a href="#">TailwindCSS</a></p>
                <p><a href="#">ExpressJS</a></p>
            </div>
            <div className={Styles.footerLinksDiv}>
                <h1>Learning Resources</h1>
                <p><a href="#">ReactJS</a></p>
                <p><a href="#">Javascript</a></p>
                <p><a href="#">NodeJS</a></p>
                <p><a href="#">TailwindCSS</a></p>
                <p><a href="#">ExpressJS</a></p>
            </div>
        </div>
    </section>
  )
}

export default Footer;