/* Lumo Sites V10.15 — mobile-first recovery. Desktop interactions remain unchanged.
   Touch smoke is deliberately passive: it never prevents vertical scrolling. */
(()=>{'use strict';
const mobile=matchMedia('(max-width:780px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const debug={version:'10.15',mobile:mobile.matches,smoke:'off',smokeParticles:0,smokeTouchPuffs:0,flips:0,lab:{mode:null,virtualWidth:0,scale:1}};
window.LUMO_V1015_DEBUG=()=>JSON.parse(JSON.stringify(debug));

// Replace symbols that iOS tends to render as colorful emoji with a monochrome SVG.
// Lab controls and their mini-site are deliberately untouched.
const arrowPaths={
 '↗':'M5 19 19 5 M9 5h10v10', '↑':'M12 19V5 M5 12l7-7 7 7',
 '→':'M4 12h16 M13 5l7 7-7 7', '←':'M20 12H4 M11 5l-7 7 7 7',
 '↖':'M19 19 5 5 M5 15V5h10','↘':'M5 5l14 14 M9 19h10V9',
 '↙':'M19 5L5 19 M5 9v10h10','↓':'M12 5v14 M5 12l7 7 7-7'
};
function svgArrow(ch){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('v1015-arrow');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',arrowPaths[ch]||arrowPaths['→']);svg.append(path);return svg;}
function normalizeArrows(){const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];
 while(walk.nextNode()){const t=walk.currentNode;if(!/[↗↖↘↙↑↓←→]/u.test(t.nodeValue||''))continue;
 const parent=t.parentElement;if(!parent||parent.closest('script,style,textarea,option,.lab-controls,.lab-viewer__devices,.aura'))continue;nodes.push(t);}
 for(const node of nodes){const raw=node.nodeValue,frag=document.createDocumentFragment();let last=0;for(const m of raw.matchAll(/[↗↖↘↙↑↓←→]/gu)){if(m.index>last)frag.append(document.createTextNode(raw.slice(last,m.index)));frag.append(svgArrow(m[0]));last=m.index+m[0].length;}if(last<raw.length)frag.append(document.createTextNode(raw.slice(last)));node.replaceWith(frag);}}
normalizeArrows();

if(mobile.matches){
 // Small opt-out message shown once per browser tab; not an overlay/modal.
 let shown=false;try{shown=sessionStorage.getItem('lumo-mobile-v1015-info')==='1';}catch(e){}
 if(!shown){const note=document.createElement('aside');note.className='v1015-mobile-notice';note.setAttribute('role','status');note.setAttribute('aria-live','polite');note.textContent='Сайт лучше всего раскрывается на компьютере — там доступны все детали и анимации. На телефоне некоторые эффекты адаптированы для плавной работы.';
  const close=document.createElement('button');close.type='button';close.setAttribute('aria-label','Закрыть уведомление');close.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 5l14 14M19 5 5 19"/></svg>';note.append(close);document.body.append(note);
  let timer=0;const hide=()=>{note.classList.remove('is-visible');setTimeout(()=>note.remove(),500);clearTimeout(timer)};close.addEventListener('click',hide);
  setTimeout(()=>{note.classList.add('is-visible');timer=setTimeout(hide,6500);},950);
  try{sessionStorage.setItem('lumo-mobile-v1015-info','1')}catch(e){}
 }

 // Flips are now handled by v1016.js with controls inside both physical faces.
 // Native CSS scroll-snap for the home gallery; prevent the old scroll timeline
 // from controlling it. The selected section no longer traps vertical movement.
 const track=$('.chapter--selected .selected__track');if(track)track.style.transform='none';
 const hint=$('.v8-device .phone-drag-hint');if(hint)hint.textContent='Проведи пальцем, чтобы повернуть устройство';
}

// Laboratory virtual desktop/tablet/phone widths. The iframe's **layout viewport**
// changes (not just its frame/container), so its media queries now reflect device mode.
const frame=$('#lab-frame'),stage=$('#lab-stage');if(frame&&stage&&!document.body.classList.contains('lumo-v1017')){
 const sizes={desktop:1280,tablet:820,phone:390};const buttons=$$('[data-device]');let mode='desktop';
 const apply=()=>{const width=sizes[mode],available=Math.max(210,stage.getBoundingClientRect().width||350);
  const scale=Math.min(1,available/width);const documentHeight=mode==='desktop'?1050:mode==='tablet'?1100:1450;
  stage.style.setProperty('--v1015-frame-width',width+'px');stage.style.setProperty('--v1015-frame-height',documentHeight+'px');stage.style.setProperty('--v1015-frame-scale',String(scale));
  stage.style.height=Math.ceil(documentHeight*scale)+'px';stage.style.maxWidth='100%';
  frame.style.width=width+'px';frame.style.height=documentHeight+'px';frame.style.maxWidth='none';frame.style.transformOrigin='0 0';frame.style.transform='scale('+scale+')';
  debug.lab={mode,virtualWidth:width,scale:+scale.toFixed(4)};
 };
 buttons.forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.device||'desktop';requestAnimationFrame(apply);}));
 // Desktop viewport remains native; only mobile needs virtual-width scaling.
 if(mobile.matches){const ro=new ResizeObserver(()=>apply());ro.observe(stage);window.addEventListener('resize',apply,{passive:true});requestAnimationFrame(apply)}
}

// Atmospheric mobile touch engine. Desktop has its existing shader/mouse engine.
if(mobile.matches&&!reduced){const layer=$('.v10-atmosphere[data-v10-atmosphere]');if(layer){
 const canvas=document.createElement('canvas');canvas.className='v1015-smoke-canvas';canvas.setAttribute('aria-hidden','true');layer.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
 const video=document.createElement('video');video.className='v1015-smoke-video';video.autoplay=true;video.loop=true;video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('muted','');video.setAttribute('playsinline','');video.src='assets/video/v8-smoke.mp4';layer.insertBefore(video,layer.firstChild);
 video.play().catch(()=>{});
 if(ctx){
 const theme=layer.dataset.v10Atmosphere||'works';const palettes={works:[[128,213,178],[181,96,132],[82,161,132]],services:[[143,206,181],[181,100,139],[91,162,135]],process:[[115,177,154],[167,85,128],[105,184,170]],lab:[[107,189,197],[167,112,190],[106,165,185]],contact:[[113,174,143],[187,91,145],[132,179,162]],about:[[128,188,148],[167,100,136],[107,165,141]]};const colors=palettes[theme]||palettes.works;
 let seed=93771;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const noise=(x,y,s)=>{const n=Math.sin(x*127.1+y*311.7+s*79.3)*43758.5453;return n-Math.floor(n)};
 const fract=(x,y,s)=>{let a=0,amp=.5;for(let k=0;k<4;k++){const ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy,uu=u*u*(3-2*u),vv=v*v*(3-2*v);const z0=noise(ix,iy,s+k*4)*(1-uu)+noise(ix+1,iy,s+k*4)*uu,z1=noise(ix,iy+1,s+k*4)*(1-uu)+noise(ix+1,iy+1,s+k*4)*uu;a+=(z0*(1-vv)+z1*vv)*amp;x=x*2.07+9.4;y=y*2.13-2.8;amp*=.51;}return a;};
 const sprites=[];for(let c=0;c<colors.length;c++){
  const sc=document.createElement('canvas');sc.width=sc.height=144;const g=sc.getContext('2d'),im=g.createImageData(144,144),rgb=colors[c];
  for(let y=0;y<144;y++)for(let x=0;x<144;x++){
   const u=(x-72)/72,v=(y-72)/72,n=fract(u*2.8+7,v*3.4+13,c+1),n2=fract(u*5-4,v*4.2+2,c+10);
   const du=u+(n-.5)*.46,dv=v+(n2-.5)*.43;
   const d=Math.sqrt(du*du*.93+dv*dv*1.13),edge=clamp((1.14-d)*2.5,0,1),wisp=clamp((n2-.18)*2,0,1);
   const alpha=Math.round(255*edge*edge*(.18+.82*wisp)*.59);
   const i=(y*144+x)*4;im.data[i]=rgb[0];im.data[i+1]=rgb[1];im.data[i+2]=rgb[2];im.data[i+3]=alpha;
  }g.putImageData(im,0,0);sprites.push(sc);
 }
 let W=0,H=0,dpr=1,frame=0,last=0,lastRendered=0,active=true,particles=[],trail=null,burstCount=0;
 const resize=()=>{const r=layer.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);dpr=Math.min(1.7,devicePixelRatio||1,Math.sqrt(950000/(W*H)));dpr=Math.max(1,dpr);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)};
 resize();new ResizeObserver(resize).observe(layer);
 const ambient=()=>{for(let i=0;i<22;i++)particles.push({x:rand()*W,y:rand()*H,r:55+rand()*135,vx:(rand()-.5)*.11,vy:-.04-rand()*.09,t:performance.now()-rand()*3000,life:7000+rand()*4200,c:i%colors.length,alpha:.20+rand()*.17,angle:rand()*6.3,touch:false});};ambient();
 const touchPuff=(x,y,dx,dy)=>{for(let j=0;j<3;j++)particles.push({x:x+(rand()-.5)*37,y:y+(rand()-.5)*37,r:32+rand()*62,vx:dx*.015+(rand()-.5)*.14,vy:dy*.011-.12-rand()*.13,t:performance.now()-rand()*90,life:2600+rand()*850,c:Math.floor(rand()*colors.length),alpha:.35+rand()*.2,angle:rand()*6.3,touch:true});
  if(particles.length>150)particles.splice(0,particles.length-150);debug.smokeTouchPuffs+=3;};
 const moveTouch=(x,y)=>{const now=performance.now();if(!trail){trail={x,y,t:now};return;}const dx=x-trail.x,dy=y-trail.y,dist=Math.hypot(dx,dy);if(dist<10)return;
  const count=Math.min(8,Math.max(1,Math.round(dist/22)));for(let i=1;i<=count;i++)touchPuff(trail.x+dx*i/count,trail.y+dy*i/count,dx/count,dy/count);trail={x,y,t:now};
  layer.style.setProperty('--v10-x',(x/W*100)+'%');layer.style.setProperty('--v10-y',(y/H*100)+'%');};
 document.addEventListener('touchstart',e=>{const t=e.touches[0];if(t)trail={x:t.clientX,y:t.clientY,t:performance.now()};},{passive:true});
 document.addEventListener('touchmove',e=>{const t=e.touches[0];if(t)moveTouch(t.clientX,t.clientY);},{passive:true});
 document.addEventListener('touchend',()=>{trail=null;},{passive:true});document.addEventListener('touchcancel',()=>{trail=null;},{passive:true});
 // On tablets with mouse/pen, movement also produces the same smoke.
 document.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')moveTouch(e.clientX,e.clientY);},{passive:true});
 const draw=now=>{frame=0;if(document.hidden){last=now;return;}if(window.scrollY>innerHeight*1.65&&now-lastRendered<32){frame=requestAnimationFrame(draw);return;}lastRendered=now;const dt=Math.min(2.3,((now-last)||16.7)/16.7);last=now;ctx.clearRect(0,0,W,H);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i],age=now-p.t,phase=age/p.life;if(phase>=1){if(p.touch){particles.splice(i,1);continue;}p.x=rand()*W;p.y=H+80;p.t=now;p.life=7500+rand()*3500;p.r=55+rand()*130;continue;}
   const grow=p.touch?1+phase*1.25:1+phase*.48;
   p.x+=p.vx*dt+Math.sin(now*.0006+p.angle)*.09;p.y+=p.vy*dt;
   const alpha=(p.touch?Math.min(1,age/180+.1)*Math.pow(1-phase,1.55):Math.sin(Math.PI*phase)*.88)*p.alpha;
   if(alpha<.002)continue;
   ctx.globalAlpha=alpha;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.angle+phase*.36);ctx.scale(1.1,.8);const rad=p.r*grow;ctx.drawImage(sprites[p.c],-rad,-rad,2*rad,2*rad);ctx.restore();
  }
  ctx.globalAlpha=1;debug.smokeParticles=particles.length;
  // Slow backgrounds when far below the hero; touch puffs still retain detail.
  frame=requestAnimationFrame(draw);
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();}else{video.play().catch(()=>{});if(!frame)frame=requestAnimationFrame(draw)}});
 frame=requestAnimationFrame(draw);debug.smoke='mobile-video+procedural-touch';
 }
}}
})();
