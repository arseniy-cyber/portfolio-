/* LUMO SITES V10.4 — natural cursor smoke and restrained gradient parallax.
   The smoke is made of advecting irregular noise volumes, NOT lines or circular strokes.
   No dependencies, graceful reduced-motion fallback, bounded per-frame work. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const layer=document.querySelector('[data-v10-atmosphere]');
const theme=document.body.dataset.v10Theme;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const debug={version:'10.4',smoke:'not-started',puffs:0,bookPages:document.querySelectorAll('.v102-book .storybook__page').length,theme};
window.LUMO_V104_DEBUG=()=>({...debug});
// Mouse input is sampled once per frame to avoid style recalculation on every pointer event.
if(['about','process'].includes(theme)&&!reduced){
 let px=0,py=0,sx=0,sy=0,raf=0;
 addEventListener('pointermove',e=>{px=clamp((e.clientX/innerWidth-.5)*34,-18,18);py=clamp((e.clientY/innerHeight-.5)*28,-15,15);if(!raf)raf=requestAnimationFrame(move);},{passive:true});
 function move(){raf=0;sx+=(px-sx)*.16;sy+=(py-sy)*.16;document.body.style.setProperty('--v104-shift-x',sx.toFixed(2)+'px');document.body.style.setProperty('--v104-shift-y',sy.toFixed(2)+'px');if(Math.abs(sx-px)+Math.abs(sy-py)>.3)raf=requestAnimationFrame(move);}
}
if(!layer||reduced||!fine){debug.smoke='disabled';return;}
// Generate six mist textures with anisotropic fBm and highly irregular soft boundaries.
const palettes=[[126,198,175],[160,227,201],[206,118,163],[175,92,132],[211,174,183],[99,163,164]];
let seed=1729;function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
function hash(x,y,k){let n=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(k,2246822519))|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y,k){let ix=Math.floor(x),iy=Math.floor(y),a=x-ix,b=y-iy;a=a*a*(3-2*a);b=b*b*(3-2*b);return (1-b)*((1-a)*hash(ix,iy,k)+a*hash(ix+1,iy,k))+b*((1-a)*hash(ix,iy+1,k)+a*hash(ix+1,iy+1,k));}
function fbm(x,y,k){return .52*noise(x,y,k)+.28*noise(2.15*x+17,2.15*y-9,k+23)+.14*noise(4.31*x-5,4.31*y+15,k+37)+.06*noise(8.02*x+7,8.02*y-11,k+49);}
function sprite(k){const S=128,c=document.createElement('canvas');c.width=c.height=S;const cx=c.getContext('2d'),a=cx.createImageData(S,S),rgb=palettes[k];
 for(let yy=0;yy<S;yy++)for(let xx=0;xx<S;xx++){
  const px=(xx-S*.5)/(S*.5),py=(yy-S*.5)/(S*.5),warp=fbm(px*2.8+9,py*2.8+6,k+11)-.5;
  const wx=px+warp*.19,wy=py+(fbm(px*3+2,py*3-4,k+30)-.5)*.23;
  const angle=Math.atan2(wy,wx),twist=.10*Math.sin(angle*4.4+warp*7+k);
  const radial=Math.sqrt(wx*wx*.78+wy*wy*1.28)+twist;
  const core=clamp((.93-radial+warp*.46)*2.2),swirl=fbm(wx*3.15+17,wy*4.8-6,k+43);
  const filaments=Math.pow(clamp((swirl-.25)*2.35),1.3);
  const vapor=clamp(core*core*(.14+filaments*.86));
  const idx=4*(yy*S+xx);a.data[idx]=rgb[0];a.data[idx+1]=rgb[1];a.data[idx+2]=rgb[2];a.data[idx+3]=Math.round(255*vapor*.78);
 }
 cx.putImageData(a,0,0);return c;
}
const sprites=palettes.map((_,i)=>sprite(i));const canvas=document.createElement('canvas');canvas.className='v102-cursor-smoke v104-natural-smoke';canvas.setAttribute('aria-hidden','true');layer.append(canvas);
const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx){debug.smoke='no-canvas';return;}
let W=1,H=1,ratio=1,active=true,raf=0,anchor=null,particles=[],lastFrame=0;
const maxPuffs=90;const decay=1470;const defaultRadius=37;
function resize(){const r=layer.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);ratio=Math.min(1.3,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(W*ratio));canvas.height=Math.max(1,Math.round(H*ratio));ctx.setTransform(ratio,0,0,ratio,0,0);}
new ResizeObserver(resize).observe(layer);resize();
new IntersectionObserver(e=>{active=Boolean(e[0]?.isIntersecting);if(active&&particles.length&&!raf)raf=requestAnimationFrame(draw);},{threshold:0}).observe(layer);
function addPuff(x,y,time,dx,dy){const n=rnd(),j=rnd(),k=(Math.floor(rnd()*sprites.length)),normal=Math.atan2(dy,dx)+Math.PI/2;
 particles.push({x:x+Math.cos(normal)*(rnd()-.5)*22,y:y+Math.sin(normal)*(rnd()-.5)*22,t:time-rnd()*70,r:defaultRadius+20*rnd(),scale:.8+1.3*rnd(),vx:dx*.012+(rnd()-.5)*.36,vy:dy*.008-.24-rnd()*.2,seed:rnd()*9,spin:(rnd()-.5)*.00035,angle:(rnd()-.5)*1.2,alpha:.23+.22*n,sprite:sprites[k]});
 if(particles.length>maxPuffs)particles.splice(0,particles.length-maxPuffs);
}
function pointer(e){if(e.pointerType==='touch'||document.hidden||!active||window.scrollY>innerHeight*1.2)return;
 const rect=layer.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
 if(x<0||y<0||x>W||y>H){anchor=null;return;}
 if(!anchor){anchor={x,y};return;}
 const dx=x-anchor.x,dy=y-anchor.y,d=Math.hypot(dx,dy);
 if(d<9)return;
 const steps=Math.min(5,Math.floor(d/19)+1),now=performance.now();
 for(let i=1;i<=steps;i++){const q=i/steps;addPuff(anchor.x+dx*q,anchor.y+dy*q,now,dx/steps,dy/steps);}
 anchor={x,y};debug.puffs=particles.length;
 if(!raf)raf=requestAnimationFrame(draw);
}
document.addEventListener('pointermove',pointer,{passive:true});
document.addEventListener('scroll',()=>{anchor=null},{passive:true});
document.addEventListener('visibilitychange',()=>{anchor=null;if(!document.hidden&&active&&particles.length&&!raf)raf=requestAnimationFrame(draw);});
function draw(now){raf=0;if(document.hidden||!active)return;const dt=Math.min(2.3,(now-lastFrame)/16.67||1);lastFrame=now;
 ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
 for(let i=particles.length-1;i>=0;i--){const p=particles[i],age=now-p.t,q=age/decay;if(q>=1){particles.splice(i,1);continue;}
  const s=p.r*p.scale*(.7+q*1.5),fade=Math.pow(1-q,1.8)*Math.min(1,age/140+.20);
  const vx=Math.sin(q*7+p.seed)*9*q;const vy=Math.cos(q*5+p.seed)*7*q;
  const x=p.x+p.vx*age*.035+vx,y=p.y+p.vy*age*.050-14*q+vy;
  ctx.save();ctx.translate(x,y);ctx.rotate(p.angle+p.spin*age);ctx.scale(1+.16*q,.86+q*.23);ctx.globalAlpha=p.alpha*fade;
  ctx.drawImage(p.sprite,-s,-s,s*2,s*2);ctx.restore();
 }
 debug.puffs=particles.length;if(particles.length)raf=requestAnimationFrame(draw);
}
debug.smoke='procedural-clouds';
})();
