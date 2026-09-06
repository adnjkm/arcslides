import React,{useState,useRef,useLayoutEffect,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Slides,{titles} from './slides.jsx';

function App(){
 const initial=Math.max(0,Math.min(Slides.length-1,(parseInt(location.hash.slice(1))||1)-1));
 const [index,setIndex]=useState(initial),[expanded,setExpanded]=useState(false),[scale,setScale]=useState(1),[controlsVisible,setControlsVisible]=useState(true);
 const roots=useRef([]),last=useRef(null),touch=useRef(null);
 useEffect(()=>{
  let idle;
  const reveal=()=>{setControlsVisible(true);clearTimeout(idle);idle=setTimeout(()=>setControlsVisible(false),1500);};
  const move=e=>{if(e.clientY>=innerHeight-90)reveal();else{clearTimeout(idle);setControlsVisible(false);}};
  const leave=()=>{clearTimeout(idle);setControlsVisible(false);};
  if(!expanded){setControlsVisible(true);return;}
  reveal();
  window.addEventListener('pointermove',move);
  window.addEventListener('pointerdown',move);
  document.documentElement.addEventListener('pointerleave',leave);
  return()=>{clearTimeout(idle);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',move);document.documentElement.removeEventListener('pointerleave',leave);};
 },[expanded]);
 const go=n=>{setIndex(current=>Math.max(0,Math.min(Slides.length-1,typeof n==='function'?n(current):n)));};
 useEffect(()=>{const resize=()=>setScale(Math.min((innerWidth-(expanded?0:48))/1440,(innerHeight-(expanded?3:60))/754));resize();addEventListener('resize',resize);return()=>removeEventListener('resize',resize);},[expanded]);
 const fullscreen=async()=>{
  if(expanded){if(document.fullscreenElement)await document.exitFullscreen();setExpanded(false);return;}
  setExpanded(true);
  try{await document.documentElement.requestFullscreen?.();}catch{}
 };
 useEffect(()=>{const change=()=>setExpanded(!!document.fullscreenElement);document.addEventListener('fullscreenchange',change);return()=>document.removeEventListener('fullscreenchange',change);},[]);
 useEffect(()=>{const key=e=>{if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(e.key===' '&&e.target.closest('button'))return;const k=e.key;if(['ArrowRight','ArrowLeft','PageDown','PageUp',' ','Home','End'].includes(k))e.preventDefault();if(['ArrowRight','PageDown',' '].includes(k))go(n=>n+1);if(['ArrowLeft','PageUp'].includes(k))go(n=>n-1);if(k==='Home')go(0);if(k==='End')go(Slides.length-1);if(k.toLowerCase()==='f')fullscreen();if(k==='Escape')setExpanded(false);};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[index,expanded]);
 useEffect(()=>{const fn=()=>go((parseInt(location.hash.slice(1))||1)-1);addEventListener('hashchange',fn);return()=>removeEventListener('hashchange',fn);},[]);
 useLayoutEffect(()=>{
  const old=last.current;
  last.current=index;
  history.replaceState(null,'',`#${index+1}`);
  // React/CSS owns visibility. Animation never hides a slide or its content,
  // so cancellation, rapid navigation and background tabs cannot strand it.
  if(old===null||old===index||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const current=roots.current[index],dir=index>old?1:-1;
  if(!current?.animate)return;
  const animation=current.animate([
   {transform:`translateX(${dir*16}px)`},
   {transform:'translateX(0)'}
  ],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
  return()=>animation.cancel();
 },[index]);

 return <main onTouchStart={e=>touch.current=e.changedTouches[0].clientX} onTouchEnd={e=>{if(touch.current!==null){const d=e.changedTouches[0].clientX-touch.current;if(Math.abs(d)>70)go(n=>n+(d<0?1:-1));touch.current=null;}}}>
  <div className="presentation" style={{width:1440*scale}}>
  <div className="progress" role="progressbar" aria-label="Presentation progress" aria-valuemin={1} aria-valuemax={Slides.length} aria-valuenow={index+1}><div style={{width:`${(index+1)/Slides.length*100}%`}}/></div>
  <div className="stage" style={{width:1440*scale,height:754*scale}}><div className="canvas" style={{transform:`scale(${scale})`}}>{Slides.map((Slide,i)=><section ref={el=>roots.current[i]=el} className="slide" key={i} aria-label={`Slide ${i+1}: ${titles[i]}`} aria-hidden={i!==index} inert={i!==index}><Slide/></section>)}</div></div>
  </div>
  <button className={`fullscreen${expanded&&!controlsVisible?' controls-hidden':''}`} onClick={fullscreen} aria-label={expanded?'Exit fullscreen':'Enter fullscreen'} title={expanded?'Exit fullscreen (Esc)':'Fullscreen (F)'}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={expanded?'M8 3v5H3m18 0h-5V3M3 16h5v5m8 0v-5h5':'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5'}/></svg></button>

 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
