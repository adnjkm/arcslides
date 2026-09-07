import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const slides=JSON.parse(fs.readFileSync('paper-export.json','utf8'));
const assets={
'4FD1CVM2R42PKCE80HABHXSBAY.jpg':'aiden-hires.jpg',
'050GXQN8CGRZ35VZ7KEAWGGZRY.png':'aaron-site.jpg',
'4KF20GXHRCAQ1AQ43S4VZM8KDT.png':'evan-site.jpg',
'67XBAP0PRE5520ZMHX921QDW8C.png':'robot-budget-current.png',
'4C8X59T06VQS8R8FT2TPC775Q9.png':'utra-logo.png',
'7CKZBCJ26B29TW9NVEW7G272ND.png':'arc-logo.png',
'6EN56FYEH533NKD4AMWXH8T80K.jpg':'competition.jpg',
'368M8DFMPHDHHYXBDRZZD1J56B.jpg':'aruw-standard.jpg',
'7G46D67Z5DCSQRG6CJZDA2AFK7.jpg':'infantry.jpg',
'14NFVEAY4ZSA4PSWTYNPGAF4JH.jpg':'aaron.jpg',
'7CVWZA360VF9EV8SV6160C6RP5.jpg':'aiden.jpg',
'1SHK5ZWV9GBZS83X7KMRTXH9XT.jpg':'evan.jpg',
'6ZH32VC2WMG7HAE46DBV9NS2FA.jpg':'max.jpg'
};
const currentTitles=['Subteam overview','ARC Robotics and our first season','Robot requirements','Robot design','Robot budget detail','Budget visualization','Funding plan','Responsibilities','Aaron Huang','Max Ma','Evan Yu','Aiden Kim','Open recruitment','Timeline','Safety'];
const originalTitles=['Subteam overview','ARC Robotics and our first season','Robot requirements','Robot design','Budget','Responsibilities','Founding team','Timeline','Safety','Talking points'];
const app=fs.readFileSync('app.jsx','utf8');
const template=fs.readFileSync('index.html','utf8');
async function buildDeck(snapshot,titles,destination,local=false){
 const used=new Set();
 const jsx=snapshot.map((s,i)=>{
  // Paper exports some text nodes as flex containers. Browser flex layout treats
  // <br> and text runs as separate items, breaking wrapping. Keep text in normal flow.
  const source=local?s.jsx.replace(/<div style=\{\{([^}]+)\}\}>((?:[^<]|<br\s*\/>)*)<\/div>/g,(all,style,content)=>
   `<div style={{${style.replace(/display: 'flex'/g,"display: 'block'")}}}>${content}</div>`):s.jsx;
  const code=source.replaceAll('\u00a0','&nbsp;').replace(/https:\/\/app\.paper\.design\/file-assets\/[^)'"\s]+/g,url=>{
   const file=assets[url.split('/').pop()];
   if(!file)throw new Error(`Unmapped Paper image: ${url}`);
   used.add(file);return `assets/${file}`;
  });
  return `function Slide${i}(){return ${code};}`;
 }).join('\n');
 fs.writeFileSync('slides.jsx',`import React from 'react';\n${jsx}\nexport const titles=${JSON.stringify(titles)};\nexport default [${snapshot.map((_,i)=>`Slide${i}`).join(',')}];\n`);
 fs.mkdirSync(destination,{recursive:true});
 await build({stdin:{contents:app,resolveDir:process.cwd(),sourcefile:'app.jsx',loader:'jsx'},bundle:true,outfile:`${destination}/bundle.js`,minify:true,jsx:'automatic'});
 fs.rmSync(`${destination}/assets`,{recursive:true,force:true});
 fs.mkdirSync(`${destination}/assets`,{recursive:true});
 for(const name of used)fs.copyFileSync(`assets/${name}`,`${destination}/assets/${name}`);
 fs.copyFileSync('style.css',`${destination}/style.css`);
 let page=template;
 for(const name of ['bundle.js','style.css']){
  const version=createHash('sha256').update(fs.readFileSync(`${destination}/${name}`)).digest('hex').slice(0,12);
  page=page.replace(name,`${name}?v=${version}`);
 }
 fs.writeFileSync(`${destination}/index.html`,page);
 if(local){
  for(const target of ['bundle.js','local-bundle.js'])fs.copyFileSync(`${destination}/bundle.js`,target);
  fs.copyFileSync('style.css','local-style.css');
  fs.copyFileSync('app.jsx','local-app.jsx');
 }
 console.log(`Built ${snapshot.length} slides at ${destination}.`);
}
await buildDeck(JSON.parse(fs.readFileSync('paper-export-original.json','utf8')),originalTitles,'docs');
await buildDeck(slides,currentTitles,'docs/new',true);
fs.writeFileSync('docs/.nojekyll','');
