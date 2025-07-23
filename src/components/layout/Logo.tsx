import Styles from "@/components/layout/layout.module.css"
import {LuBookOpenText} from "react-icons/lu";
import Link from 'next/link';

export default function Logo(){
  return (
    <Link href="/">
    <div className={Styles.logo}>
      <h1><LuBookOpenText/> Stack<span> TALES</span></h1>
    </div>
    </Link>
  );
}
