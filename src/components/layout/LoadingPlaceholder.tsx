import {LuLoaderCircle} from "react-icons/lu";


const LoadingPlaceholder = () => {
  return (
    <div style={{width:'90%',maxWidth:'900px',margin:'0 auto',paddingTop:'6rem',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:'10px'}}>
      <LuLoaderCircle className="LoaderSpin" style={{width:'30px',height:'30px'}}/>
      <span style={{marginTop:'1rem',height:'20px',width:'50%',maxWidth:'500px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
      <span style={{marginTop:'0px',height:'50px',width:'100%',maxWidth:'900px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
      
      <span style={{marginTop:'1rem',height:'20px',width:'50%',maxWidth:'500px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
      <span style={{marginTop:'0px',height:'50px',width:'100%',maxWidth:'900px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
      
      <span style={{marginTop:'1rem',height:'20px',width:'50%',maxWidth:'500px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
      <span style={{marginTop:'0px',height:'50px',width:'100%',maxWidth:'900px',background:'rgba(var(--color),0.2)',borderRadius:'10px',animation:'placeholder 3s linear infinite'}}></span>
    </div>
  )
}

export default LoadingPlaceholder;