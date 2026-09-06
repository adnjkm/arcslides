import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
const slides=JSON.parse(fs.readFileSync('paper-export.json','utf8'));
const assets={
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
const used=new Set();
const titles=['Subteam overview','ARC Robotics and our first season','Robot requirements','Robot design','Budget','Responsibilities','Founding team','Timeline','Talking points'];
const jsx=slides.map((s,i)=>{
 const code=s.jsx.replaceAll('\u00a0','&nbsp;').replace(/https:\/\/app\.paper\.design\/file-assets\/[^)'"\s]+/g,url=>{
 const file=assets[url.split('/').pop()];
 if(!file)throw new Error(`Unmapped Paper image: ${url}`);
 used.add(file);return `assets/${file}`;
 });
 return `function Slide${i}(){return ${code};}`;
}).join('\n');
fs.writeFileSync('slides.jsx',`import React from 'react';\n${jsx}\nexport const titles=${JSON.stringify(titles)};\nexport default [${slides.map((_,i)=>`Slide${i}`).join(',')}];\n`);
await build({entryPoints:['app.jsx'],bundle:true,outfile:'bundle.js',minify:true,jsx:'automatic'});
fs.rmSync('docs/assets',{recursive:true,force:true});
fs.mkdirSync('docs/assets',{recursive:true});
for(const name of ['index.html','style.css','bundle.js'])fs.copyFileSync(name,`docs/${name}`);
for(const name of used)fs.copyFileSync(`assets/${name}`,`docs/assets/${name}`);
// Version asset URLs so browsers fetch the matching build after a refresh.
let page=fs.readFileSync('index.html','utf8');
for(const name of ['bundle.js','style.css']){
 const version=createHash('sha256').update(fs.readFileSync(name)).digest('hex').slice(0,12);
 page=page.replace(name,`${name}?v=${version}`);
}
fs.writeFileSync('docs/index.html',page);
fs.writeFileSync('docs/.nojekyll','');
// Keep the existing local preview server on the same published build.
for (const [from,to] of [['bundle.js','local-bundle.js'],['style.css','local-style.css'],['app.jsx','local-app.jsx']]) fs.copyFileSync(from,to);
console.log(`Built ${slides.length} slides with ${used.size} local images for localhost and GitHub Pages.`);
