import React,{useState,useRef,useLayoutEffect,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal} from 'react-dom';
import Slides,{titles,speakerNotes} from './slides.jsx';

function SlidePreview({index,label}){
 const container=useRef(null),[scale,setScale]=useState(0);
 useLayoutEffect(()=>{
  const element=container.current;
  const Observer=element.ownerDocument.defaultView.ResizeObserver;
  const observer=new Observer(()=>setScale(element.clientWidth/1440));
  observer.observe(element);setScale(element.clientWidth/1440);
  return()=>observer.disconnect();
 },[]);
 const Slide=Slides[index];
 return <section className="presenter-preview" aria-label={`${label}: ${titles[index]}`}>
  <h2 className="presenter-label">{label}</h2>
  <div ref={container} className="presenter-slide-frame">
   <div className="canvas" style={{transform:`scale(${scale})`}}><div className="slide" aria-hidden="false"><Slide/></div></div>
  </div>
 </section>;
}

function App(){
 const initial=Math.max(0,Math.min(Slides.length-1,(parseInt(location.hash.slice(1))||1)-1));
 const [index,setIndex]=useState(initial),[expanded,setExpanded]=useState(false),[scale,setScale]=useState(1),[controlsVisible,setControlsVisible]=useState(true);
 const roots=useRef([]),last=useRef(null),touch=useRef(null),scriptPanel=useRef(null),notesWindow=useRef(null);
 const [scriptOpen,setScriptOpen]=useState(false),[notesTarget,setNotesTarget]=useState(null),[notesError,setNotesError]=useState(''),[inlineNotes,setInlineNotes]=useState(false);
 const closeInlineNotes=()=>{setScriptOpen(false);setNotesTarget(null);setInlineNotes(false);requestAnimationFrame(()=>document.querySelector('.script-toggle')?.focus());};
 const openNotes=()=>{
  if(mobile){
   notesWindow.current?.close();notesWindow.current=null;
   setInlineNotes(true);setNotesTarget(document.body);setScriptOpen(true);setNotesError('');return;
  }
  if(notesWindow.current&&!notesWindow.current.closed){notesWindow.current.focus();return;}
  const popup=window.open('','', 'popup=yes,width=1280,height=850,resizable=yes,scrollbars=yes');
  if(!popup){setNotesError('Allow pop-ups for this site to open speaker notes.');return;}
  popup.document.title='Presenter view - ARC Robotics';
  const base=popup.document.createElement('base');base.href=new URL('.',location.href).href;popup.document.head.appendChild(base);
  const stylesheet=popup.document.createElement('link');
  stylesheet.rel='stylesheet';stylesheet.href=new URL('style.css',location.href).href;
  popup.document.head.appendChild(stylesheet);
  popup.document.body.className='notes-window';
  const target=popup.document.createElement('div');popup.document.body.appendChild(target);
  notesWindow.current=popup;setNotesTarget(target);setScriptOpen(true);setNotesError('');
 };
 useEffect(()=>{
  if(!scriptOpen||inlineNotes)return;
  const popup=notesWindow.current;
  const closed=()=>{setScriptOpen(false);setNotesTarget(null);notesWindow.current=null;};
  const key=e=>{
   if(e.target.closest('button,input,textarea,select,[contenteditable=true]'))return;
   if(e.key==='Escape'){popup.close();closed();return;}
   if(['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();go(n=>n+(e.key==='ArrowRight'?1:-1));}
  };
  popup.addEventListener('keydown',key);
  const timer=setInterval(()=>{if(popup.closed)closed();},500);
  return()=>{clearInterval(timer);popup.removeEventListener('keydown',key);};
 },[scriptOpen,inlineNotes]);
 useEffect(()=>{const close=()=>notesWindow.current?.close();window.addEventListener('pagehide',close);return()=>{window.removeEventListener('pagehide',close);close();};},[]);
 useEffect(()=>{if(scriptPanel.current)scriptPanel.current.scrollTop=0;},[index,scriptOpen]);
 const [mobile,setMobile]=useState(()=>matchMedia('(pointer: coarse), (max-width: 760px)').matches);
 useEffect(()=>{const media=matchMedia('(pointer: coarse), (max-width: 760px)');const change=()=>setMobile(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{
  let idle;
  const reveal=()=>{setControlsVisible(true);clearTimeout(idle);idle=setTimeout(()=>setControlsVisible(false),1500);};
  const move=e=>{if(mobile||e.pointerType==='touch')return;if(e.clientY>=innerHeight-90)reveal();else{clearTimeout(idle);setControlsVisible(false);}};
  const tap=e=>{if(mobile||e.pointerType==='touch')reveal();};
  const leave=e=>{if(mobile||e.pointerType==='touch')return;clearTimeout(idle);setControlsVisible(false);};
  if(!expanded){setControlsVisible(true);return;}
  reveal();
  window.addEventListener('pointermove',move);
  window.addEventListener('pointerdown',move);
  window.addEventListener('pointerup',tap);
  document.documentElement.addEventListener('pointerleave',leave);
  return()=>{clearTimeout(idle);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',move);window.removeEventListener('pointerup',tap);document.documentElement.removeEventListener('pointerleave',leave);};
 },[expanded,mobile]);
 const go=n=>{setIndex(current=>Math.max(0,Math.min(Slides.length-1,typeof n==='function'?n(current):n)));};
 useEffect(()=>{const resize=()=>{const width=document.documentElement.clientWidth,height=window.visualViewport?.height??innerHeight;const fill=expanded||(mobile&&width>height);setScale(Math.max(0,Math.min((width-(fill?0:mobile?16:48))/1440,(height-(fill?3:mobile?100:60))/754)));};resize();addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);return()=>{removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);};},[expanded,mobile]);
 const fullscreen=async()=>{
  if(expanded){if(document.fullscreenElement)await document.exitFullscreen();setExpanded(false);return;}
  setExpanded(true);
  try{await document.documentElement.requestFullscreen?.();}catch{}
 };
 useEffect(()=>{const change=()=>setExpanded(!!document.fullscreenElement);document.addEventListener('fullscreenchange',change);return()=>document.removeEventListener('fullscreenchange',change);},[]);
 useEffect(()=>{const key=e=>{if(e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(e.key===' '&&e.target.closest('button'))return;const k=e.key;if(k==='Escape'&&inlineNotes){e.preventDefault();closeInlineNotes();return;}if(e.target.closest('.script-panel')&&['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(k))return;if(k.toLowerCase()==='s'&&speakerNotes){e.preventDefault();openNotes();return;}if(['ArrowRight','ArrowLeft','PageDown','PageUp',' ','Home','End'].includes(k))e.preventDefault();if(['ArrowRight','PageDown',' '].includes(k))go(n=>n+1);if(['ArrowLeft','PageUp'].includes(k))go(n=>n-1);if(k==='Home')go(0);if(k==='End')go(Slides.length-1);if(k.toLowerCase()==='f')fullscreen();if(k==='Escape')setExpanded(false);};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[index,expanded,scriptOpen,mobile,inlineNotes]);
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

 return <main inert={inlineNotes} className={mobile?'mobile':''} onTouchStart={e=>{touch.current=e.touches.length===1&&!e.target.closest('button,.script-panel,.presenter-view')?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;}} onTouchCancel={()=>touch.current=null} onTouchEnd={e=>{const start=touch.current;touch.current=null;if(!start)return;const end=e.changedTouches[0],dx=end.clientX-start.x,dy=end.clientY-start.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)go(n=>n+(dx<0?1:-1));}}>
  <div className="presentation" style={{width:1440*scale}}>
  <div className="progress" role="progressbar" aria-label="Presentation progress" aria-valuemin={1} aria-valuemax={Slides.length} aria-valuenow={index+1}><div style={{width:`${(index+1)/Slides.length*100}%`}}/></div>
  <div className="stage" style={{width:1440*scale,height:754*scale}}><div className="canvas" style={{transform:`scale(${scale})`}}>{Slides.map((Slide,i)=><section ref={el=>roots.current[i]=el} className="slide" key={i} aria-label={`Slide ${i+1}: ${titles[i]}`} aria-hidden={i!==index} inert={i!==index}><Slide/></section>)}</div></div>
  </div>
  {speakerNotes&&scriptOpen&&notesTarget&&createPortal(<div className={inlineNotes?'notes-window presenter-inline':'notes-window'} role={inlineNotes?'dialog':undefined} aria-modal={inlineNotes?true:undefined} aria-label="Presenter view"><div className="presenter-view">
   {inlineNotes&&<div className="notes-navigation"><button autoFocus onClick={closeInlineNotes}>Back to slides</button></div>}
   <nav className="notes-navigation" aria-label="Slide navigation">
    <button onClick={()=>go(n=>n-1)} disabled={index===0}>Previous</button>
    <span>Slide {index+1} of {Slides.length}</span>
    <button onClick={()=>go(n=>n+1)} disabled={index===Slides.length-1}>Next</button>
   </nav>
   <div className="presenter-layout">
    <div className="presenter-current">
     <SlidePreview index={index} label="Current slide"/>
     <div className="presenter-next">{index<Slides.length-1?<SlidePreview index={index+1} label="Up next"/>:<p className="presenter-end">End of presentation</p>}</div>
    </div>
    <div className="presenter-sidebar">
     <aside id="speaker-script" ref={scriptPanel} className="script-panel" role="region" aria-label="Current slide script" tabIndex={0}>
   <h2 className="presenter-label">Speaker notes</h2>
   <h2>{titles[index]}</h2>
   {speakerNotes[index+1]?.length?<ul>{speakerNotes[index+1].map((text,i)=><li key={`${index}-${i}`}>{text}</li>)}</ul>:<p>No script added for this slide.</p>}
  </aside></div></div></div></div>,notesTarget)}
  {notesError&&<p className="notes-error" role="alert">{notesError}</p>}
  {speakerNotes&&<button className={`fullscreen script-toggle${expanded&&!controlsVisible?' controls-hidden':''}`} onClick={openNotes} aria-label={mobile?'Open presenter view':scriptOpen?'Focus speaker notes window':'Open speaker notes window'} aria-pressed={scriptOpen} title={mobile?"Open presenter view (S)":"Open speaker notes window (S)"}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H5V3h1Zm8 0v5h5M8 12h8M8 16h8"/></svg></button>}
  {mobile&&<nav className={`mobile-navigation${expanded&&!controlsVisible?' controls-hidden':''}`} aria-label="Slide navigation">
   <button onClick={()=>go(n=>n-1)} disabled={index===0} aria-label="Previous slide"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button>
   <button onClick={()=>go(n=>n+1)} disabled={index===Slides.length-1} aria-label="Next slide"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button>
  </nav>}
  <button className={`fullscreen${expanded&&!controlsVisible?' controls-hidden':''}`} onClick={fullscreen} aria-label={expanded?'Exit fullscreen':'Enter fullscreen'} title={expanded?'Exit fullscreen (Esc)':'Fullscreen (F)'}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={expanded?'M8 3v5H3m18 0h-5V3M3 16h5v5m8 0v-5h5':'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5'}/></svg></button>

 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
