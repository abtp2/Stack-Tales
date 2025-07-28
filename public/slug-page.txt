import Navbar from "@/components/layout/Navbar";
import Styles from "../blog.module.css";
import Code from "@/components/layout/Code";
import { LuClock,LuTwitter } from "react-icons/lu";
import { FaLinkedin } from "react-icons/fa";
const blogTagsList = [
  "#JavaScript",
  "#ReactJS",
  "#NextJS",
  "#TypeScript",
  "#NodeJS",
];


const page = () => {
  return(
    <>
    <Navbar/>
    <section>
      <div className={`${Styles.blogTags} overflow-none`}>
        {blogTagsList.map((tag,index) =>(
        <p key={index}>{tag}</p>
        ))}
      </div>
      <main className={Styles.blogContainer}>
        <div className={Styles.blogTitle}>
          <h2>React Performance Optimization Techniques</h2>
          <span>
            <img src="/avatar1.jpg"/>
            <h1>Ashutosh Pandey <p>15 June 2025</p></h1>
          </span>
          <div>
            <p><LuClock/> 5 Min Read</p>
            <p><LuTwitter/> Share on Twitter</p>
            <p><FaLinkedin/> Share on LinkedIn</p>
          </div>
        </div>
        <div className={Styles.blogContent}>
          <p>React is designed for optimal rendering performance out of the box, but as applications grow, inefficiencies can creep in. Here's a comprehensive guide to optimizing performance in React applications.</p>
          
          <h2>Why Performance Optimization Matters</h2>
          <p>Poor performance can lead to slow UI, high memory usage, and a frustrating user experience. Optimization improves rendering speed, responsiveness, and scalability.</p>
          
          <h2>1. Use <code>React.memo</code> to Prevent Unnecessary Re-renders</h2>
          <p><code>React.memo</code> is a higher-order component that memoizes a functional component. It skips re-rendering when props haven’t changed.</p>
          <Code language="javascript">
          {`const MyComponent = React.memo(({ name }) => {
  return <div>{name}</div>;
});`}</Code>
        
          <h2>2. Memoize Functions with <code>useCallback</code></h2>
          <p><code>useCallback</code> helps prevent re-creating functions on every render:</p>
          <Code language="javascript">{`const handleClick = useCallback(() => {
  console.log("Button clicked");
}, []);`}</Code>
        
          <h2>3. Cache Expensive Values with <code>useMemo</code></h2>
          <p><code>useMemo</code> caches computationally expensive values so they don’t get recalculated on every render.</p>
          <Code language="javascript">{`const sortedData = useMemo(() => heavySort(data), [data]);`}</Code>
        
          <h2>4. Code Splitting with <code>React.lazy</code> and <code>Suspense</code></h2>
          <p>Code splitting helps reduce the initial bundle size by loading components lazily.</p>
          <Code language="javascript">{`const LazyComponent = React.lazy(() => import('./LazyComponent'));
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>`}</Code>
        
          <h2>5. Avoid Anonymous Functions in JSX</h2>
          <p>Declaring functions inline inside JSX causes re-creation on every render, which affects performance.</p>
          <Code language="javascript">{`//Avoid
<button onClick={() => console.log("Click")}>Click</button>
        
//use
const handleClick = () => console.log("Click");
<button onClick={handleClick}>Click</button>`}</Code>
        
          <h2>6. Use List Virtualization for Long Lists</h2>
          <p>Rendering large lists can be expensive. Use libraries like <code>react-window</code> or <code>react-virtualized</code>:</p>
          <Code language="javascript">{`import { FixedSizeList as List } from 'react-window';
<List height={400} itemCount={1000} itemSize={35} width={300}>
  {({ index, style }) => <div style={style}>Item {index}</div>}
</List>`}</Code>
        
          <h2>7. Debounce or Throttle Expensive Events</h2>
          <p>For inputs, scrolls, and resize events, debounce or throttle the handlers using lodash or custom functions.</p>
          <Code language="javascript">{`import debounce from 'lodash.debounce';
const handleChange = debounce((e) => {
  console.log(e.target.value);
}, 300);`}</Code>
        
          <h2>8. Optimize State Management</h2>
          <p>Keep state local where possible. Global state should only be used when absolutely necessary.</p>
          <ul>
            <li>Avoid unnecessary prop drilling</li>
            <li>Split large state into smaller slices</li>
            <li>Use libraries like Zustand, Redux, or Jotai effectively</li>
          </ul>
        
          <h2>9. Analyze and Profile Performance</h2>
          <p>Use Chrome DevTools and React Developer Tools to find unnecessary renders, slow components, and memory leaks.</p>
          <blockquote>
            “What gets measured gets improved.” — Peter Drucker
          </blockquote>
        
          <h2>Checklist for React Performance Optimization</h2>
          <ol>
            <li>Use <code>React.memo</code> to prevent re-renders</li>
            <li>Memoize callbacks and values with <code>useCallback</code> / <code>useMemo</code></li>
            <li>Split code using <code>React.lazy</code></li>
            <li>Virtualize long lists</li>
            <li>Throttle or debounce rapid-fire events</li>
            <li>Use proper state management</li>
            <li>Measure performance regularly</li>
          </ol>
        
          <h2>Conclusion</h2>
          <p>React gives us tools to build efficient UIs, but real performance comes from understanding and applying best practices. Implement these strategies gradually, measure your improvements, and your users will feel the difference.</p>
        </div>
      </main>
    </section>
    </>
  );
}

export default page;