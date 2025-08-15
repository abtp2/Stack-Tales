import React from 'react';
import Styles from "./layout.module.css";
import Logo from './Logo';
import { LuCopyright } from "react-icons/lu";


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
        <h2> <LuCopyright/> {new Date().getFullYear()} StackTales. All rights reserved</h2>
    </section>
  )
}

export default Footer;