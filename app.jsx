import React,{useState,useRef,useLayoutEffect,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Slides,{titles} from './slides.jsx';

function App(){
 const initial=Math.max(0,Math.min(Slides.length-1,(parseInt(location.hash.slice(1))||1)-1));
 const [index,setIndex]=useState(initial),[overview,setOverview]=useState(false),[help,setHelp]=useState(false),[scale,setScale]=useState(1);
 const roots=useRef([]),last=useRef(null),timers=useRef([]),animations=useRef([]),touch=useRef(null);
 const go=n=>{setOverview(false);setIndex(Math.max(0,Math.min(Slides.length-1,n)));};
 useEffect(()=>{const resize=()=>setScale(Math.min((innerWidth-48)/1440,(innerHeight-132)/900));resize();addEventListener('resize',resize);return()=>removeEventListener('resize',resize);},[]);
 const fullscreen=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.().catch(()=>{});
 useEffect(()=>{const key=e=>{if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(e.key===' '&&e.target.closest('button,a'))return;const k=e.key;if(['ArrowRight','ArrowLeft','PageDown','PageUp',' ','Home','End'].includes(k))e.preventDefault();if(['ArrowRight','PageDown',' '].includes(k))go(index+1);if(['ArrowLeft','PageUp'].includes(k))go(index-1);if(k==='Home')go(0);if(k==='End')go(Slides.length-1);if(k.toLowerCase()==='f')fullscreen();if(k.toLowerCase()==='o')setOverview(v=>!v);if(k==='?')setHelp(v=>!v);if(k==='Escape'){setOverview(false);setHelp(false);}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[index]);
 useEffect(()=>{const fn=()=>go((parseInt(location.hash.slice(1))||1)-1);addEventListener('hashchange',fn);return()=>removeEventListener('hashchange',fn);},[]);
 useLayoutEffect(()=>{
  timers.current.forEach(clearTimeout);animations.current.forEach(a=>a.cancel());timers.current=[];animations.current=[];
  const old=last.current,current=roots.current[index],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,dir=old===null||index>=old?1:-1;
  roots.current.forEach(el=>{if(el){el.style.visibility='hidden';el.style.zIndex='0';}});
  current.style.visibility='visible';current.style.zIndex='2';
  if(old!==null&&old!==index&&!reduced){const before=roots.current[old];before.style.visibility='visible';before.style.zIndex='1';animations.current.push(before.animate([{opacity:1,transform:'translateX(0) scale(1)'},{opacity:0,transform:`translateX(${-dir*100}px) scale(.97)`}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}));timers.current.push(setTimeout(()=>{before.style.visibility='hidden';},530));}
  if(!reduced){animations.current.push(current.animate([{opacity:0,transform:`translateX(${dir*110}px) scale(.97)`},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'}));Array.from(current.firstElementChild.children).forEach((child,i)=>{animations.current.push(child.animate([{opacity:0,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:100+i*45,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));});}
  last.current=index;history.replaceState(null,'',`#${index+1}`);
 },[index]);
 return <main onTouchStart={e=>touch.current=e.changedTouches[0].clientX} onTouchEnd={e=>{if(touch.current!==null){const d=e.changedTouches[0].clientX-touch.current;if(Math.abs(d)>70)go(index+(d<0?1:-1));touch.current=null;}}}>
  <header><div className="brand">ARC<span>ROBOTICS</span><i/>UTRA</div><div className="season">2026–2027 <span>Operating plan</span></div></header>
  <div className="stage" style={{width:1440*scale,height:900*scale}}><div className="canvas" style={{transform:`scale(${scale})`}}>{Slides.map((Slide,i)=><section ref={el=>roots.current[i]=el} className="slide" key={i} aria-label={`Slide ${i+1}: ${titles[i]}`} aria-hidden={i!==index} inert={i!==index}><Slide/></section>)}</div></div>
  <footer><div className="slide-label" aria-live="polite"><strong>{String(index+1).padStart(2,'0')}</strong><span>/ {Slides.length}</span><i/>{titles[index]}</div><nav aria-label="Presentation controls"><button onClick={()=>setOverview(true)} title="All slides (O)">All slides</button><button onClick={()=>setHelp(true)} aria-label="Keyboard shortcuts">?</button><button onClick={fullscreen} title="Fullscreen (F)">Fullscreen</button><button disabled={index===0} onClick={()=>go(index-1)} aria-label="Previous slide">←</button><button disabled={index===Slides.length-1} onClick={()=>go(index+1)} aria-label="Next slide">→</button></nav></footer>
  <div className="progress"><div style={{width:`${(index+1)/Slides.length*100}%`}}/></div>
  {overview&&<div className="overlay" role="dialog" aria-modal="true" aria-label="All slides"><div className="overlay-head"><h2>Choose a slide</h2><button autoFocus onClick={()=>setOverview(false)}>Close</button></div><div className="slide-menu">{titles.map((t,i)=><button key={t} className={i===index?'selected':''} onClick={()=>go(i)}><span>{String(i+1).padStart(2,'0')}</span>{t}</button>)}</div></div>}
  {help&&<div className="overlay help" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts"><h2>Presentation controls</h2><p>← / → or Space: change slide</p><p>F: fullscreen · O: all slides</p><p>Home / End: first / last slide</p><p>Swipe left or right on touchscreens.</p><p>Escape: close this panel</p><button autoFocus onClick={()=>setHelp(false)}>Close</button></div>}
 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
