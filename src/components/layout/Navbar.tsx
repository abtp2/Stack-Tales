"use client";
import Logo from "@/components/layout/Logo";
import Styles from "@/components/layout/layout.module.css";
import {LuMenu,LuSearch,LuX} from "react-icons/lu";
import {useState,useEffect} from "react";


export default function Navbar(){
const [sidebar, setSidebar] = useState(false);

  return (
    <div className={Styles.nav}>
      <Logo/>
      <span>
        <div className={Styles.sidebar} style={sidebar ? {left:'0'} : {left:'-100%'}}>
          <LuX onClick={()=>{setSidebar(false)}}/>
          <p>Courses</p>
          <p>Categories</p>
          <p>Certificate</p>
          <p>About</p>
        </div>
        <p className={Styles.searchIcon}><LuSearch/> <input placeholder="Search Blogs"/></p>
        <LuMenu className={Styles.menuIcon} onClick={()=>{setSidebar(true)}}/>
      </span>
    </div>
  );
}
