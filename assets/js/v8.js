/* LUMO SITES V8: native-scroll-driven typography, atmospheric motion, and proper book interactions.
   No wheel hijacking, no external dependencies. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const C=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=x=>1-Math.pow(1-C(x),3);
const hero=document.getElementById('hero');
const chars=[...document.querySelectorAll('.v8-hero-char')];
const heads=[...document.querySelectorAll('[data-v8-scroll-head]')];
const outros=[...document.querySelectorAll('.v8-outro')];
const footer=document.querySelector('.v8-footer-outro');
const atmosphere=[...document.querySelectorAll('.v8-smoke-atmosphere')];
let pending=false;
function onScroll(){pending=false;const vh=Math.max(1,innerHeight);
 if(hero&&chars.length){const r=hero.getBoundingClientRect();const p=C(-r.top/Math.max(1,r.height-vh));
  chars.forEach((ch,i)=>{const phase=reduce?1:ease((p-(.045+i*.032))/.44);
   ch.style.setProperty('--v8-char-opacity',String(phase));ch.style.setProperty('--v8-char-x',(reduce?0:(1-phase)*(56+i*6))+'px');ch.style.setProperty('--v8-char-y',(reduce?0:(1-phase)*(i%2?-22:27))+'px');
   ch.style.setProperty('--v8-char-angle',(reduce?0:(1-phase)*(i%2?-4.5:4.5))+'deg');ch.style.setProperty('--v8-char-blur',(reduce?0:(1-phase)*.55)+'px');
  });const dot=hero.querySelector('.hero-scroll__dot');if(dot){const z=reduce?1:ease((p-.53)/.34);dot.style.setProperty('--v8-dot-opacity',z);dot.style.setProperty('--v8-dot-x',(1-z)*45+'px');}
 }
 heads.forEach(h=>{const r=h.getBoundingClientRect(),p=C((vh*.92-r.top)/Math.max(1,vh*.85));
  if(!reduce)h.style.setProperty('--v8-head-lift',((1-p)*17).toFixed(1)+'px');
 });
 const scenes=[...document.querySelectorAll('.v8-works-hero,.v8-contact-hero,.v8-lab-hero')];
 scenes.forEach(s=>{const r=s.getBoundingClientRect(),p=C((vh-r.top)/(vh+r.height));s.style.setProperty('--v8-scene-progress',p.toFixed(3));});
 outros.forEach(o=>{const r=o.getBoundingClientRect(),p=C((vh*.6-r.top)/(r.height+vh*.4));o.style.setProperty('--v8-outro-offset',(reduce?0:(.5-p)*44).toFixed(1)+'px');});
 if(footer){const r=footer.getBoundingClientRect(),p=C((vh-r.top)/(vh+r.height));footer.style.setProperty('--v8-footer-x',(reduce?0:(.4-p)*29).toFixed(1)+'px');}
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(onScroll)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});addEventListener('load',schedule,{once:true});schedule();
// Native 2D particles sit over a real pre-rendered 4-second atmospheric video.
// Pointer interaction changes their flow; video alone never pretends to react.
function smoke(cover){if(reduce||document.body.classList.contains('lumo-v101'))return;const parent=cover.parentElement,canvas=cover.querySelector('canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;const vid=cover.querySelector('video');if(vid){vid.muted=true;vid.defaultMuted=true;vid.playsInline=true;vid.setAttribute('muted','');vid.play().catch(()=>{});}
 let w=1,h=1,dpr=1,active=false,raf=0,last=0,particles=[],px=.5,py=.5,lastX=0,lastY=0;
 const resize=()=>{const r=cover.getBoundingClientRect();w=Math.max(1,r.width);h=Math.max(1,r.height);dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
 resize();const ro=new ResizeObserver(resize);ro.observe(cover);
 const io=new IntersectionObserver(entries=>{active=!!entries[0]?.isIntersecting;if(active&&!document.hidden){vid?.play().catch(()=>{});if(!raf)raf=requestAnimationFrame(frame)}else{vid?.pause();}},{threshold:0});io.observe(parent);
 const update=e=>{const r=cover.getBoundingClientRect();const x=C((e.clientX-r.left)/Math.max(1,r.width)),y=C((e.clientY-r.top)/Math.max(1,r.height));
  const speed=Math.hypot(x-lastX,y-lastY);px=x;py=y;lastX=x;lastY=y;cover.style.setProperty('--v8-smoke-x',(x*100)+'%');cover.style.setProperty('--v8-smoke-y',(y*100)+'%');
  if(!fine||!active)return;const amt=Math.min(12,Math.max(2,Math.ceil(speed*28)));
  for(let i=0;i<amt;i++){const a=(i/amt)*Math.PI*2+performance.now()*.003;const color=i%4===0?'177,213,165':i%3===0?'134,67,99':'61,133,98';particles.push({x:x*w+(Math.random()-.5)*24,y:y*h+(Math.random()-.5)*23,vx:Math.cos(a)*(.5+Math.random()*1.7),vy:Math.sin(a)*(.5+Math.random()*1.6)-.25,life:1,r:12+Math.random()*19,color});}
  if(particles.length>160)particles=particles.slice(-160);
 };
 parent.addEventListener('pointermove',update,{passive:true});
 function frame(now){raf=0;if(!active||document.hidden)return;const dt=Math.min(2,(now-last)/16.7||1);last=now;ctx.clearRect(0,0,w,h);
  for(let i=particles.length-1;i>=0;i--){const q=particles[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.985;q.vy-=.017*dt;q.life-=.011*dt;q.r+=.28*dt;
   if(q.life<=0){particles.splice(i,1);continue;}
   const rr=q.r*2.35,grad=ctx.createRadialGradient(q.x,q.y,0,q.x,q.y,rr);grad.addColorStop(0,'rgba('+q.color+','+(q.life*.14).toFixed(3)+')');grad.addColorStop(.35,'rgba('+q.color+','+(q.life*.085).toFixed(3)+')');grad.addColorStop(1,'rgba('+q.color+',0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(q.x,q.y,rr,0,Math.PI*2);ctx.fill();
  }
  raf=requestAnimationFrame(frame);
 }
}
atmosphere.forEach(smoke);
// Book behaviour moved into v10.js; V9-inspired page mechanics.
// Service mini-sculptures respond mildly, while service flip animation and touch toggles remain native.
if(fine&&!reduce){
 document.querySelectorAll('.v8-services-grid .service-flip').forEach(c=>{const art=c.querySelector('.v8-service-art');if(!art)return;c.addEventListener('pointermove',e=>{const b=c.getBoundingClientRect(),x=(e.clientX-b.left-b.width/2)/b.width,y=(e.clientY-b.top-b.height/2)/b.height;art.style.transform=`translate3d(${(x*8).toFixed(1)}px,${(y*8).toFixed(1)}px,0) rotateY(${(-16+x*8).toFixed(1)}deg)`},{passive:true});c.addEventListener('pointerleave',()=>art.style.transform='');});
}
window.LUMO_V8_DEBUG={version:'8.0',atmosphereCount:atmosphere.length,heroLetterCount:chars.length,services:document.querySelectorAll('.service-flip').length};
})();
