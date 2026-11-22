/* V10.5: large textured mouse-driven vapor, source-contained background video movement.
 * Separate diffuse smoke puffs: never bright stroked lines or circular outlines. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,canHover=matchMedia('(pointer:fine)').matches;
const theme=document.body.dataset.v10Theme||'';let gradient=document.querySelector('.v105-gradient-video');
if(gradient&&!reduced){let tx=54,ty=46,cx=54,cy=46,rid=0;
 document.addEventListener('pointermove',e=>{tx=e.clientX/innerWidth*100;ty=e.clientY/innerHeight*100;if(!rid)rid=requestAnimationFrame(tick)},{passive:true});
 function tick(){cx+=(tx-cx)*.095;cy+=(ty-cy)*.095;document.body.style.setProperty('--v105-x',cx.toFixed(2)+'%');document.body.style.setProperty('--v105-y',cy.toFixed(2)+'%');rid=Math.abs(cx-tx)+Math.abs(cy-ty)>.1?requestAnimationFrame(tick):0}
}
const atmo=document.querySelector('[data-v10-atmosphere]');
const isProcess=theme==='process';
const debug={version:'10.5',vapor:'disabled',particles:0};window.LUMO_V105_DEBUG=()=>({...debug});
if(!atmo||!canHover||reduced)return;
const canvas=document.createElement('canvas');canvas.className='v105-vapor';canvas.setAttribute('aria-hidden','true');atmo.appendChild(canvas);
const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));let rng=21006;const rand=()=>((rng=Math.imul(1664525,rng)+1013904223>>>0)/4294967296);
// Irregular turbulence masks, not concentric alpha circles. Four palettes intentionally diffuse.
function noise(x,y,k){const hash=(a,b)=>{let n=Math.imul(a+53*k,374761393)^Math.imul(b+19*k,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295};let a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return (1-v)*((1-u)*hash(a,b)+u*hash(a+1,b))+v*((1-u)*hash(a,b+1)+u*hash(a+1,b+1))}
function fbm(x,y,k){return noise(x,y,k)*.55+noise(x*2.2+8,y*2.2-7,k+11)*.3+noise(x*4.5-5,y*4.5+4,k+19)*.15}
const colors=[[143,225,196],[118,199,180],[188,109,147],[226,149,178],[146,190,200],[223,181,183]];
function create(i){let s=160,c=document.createElement('canvas');c.width=c.height=s;let x=c.getContext('2d'),im=x.createImageData(s,s),r=colors[i];for(let y=0;y<s;y++)for(let xx=0;xx<s;xx++){
 let u=(xx-s/2)/(s/2),v=(y-s/2)/(s/2),n=fbm(u*3.3+12,v*3.3+8,i+19),m=fbm(u*6-9,v*4+5,i+39);
 let warpU=u+(n-.5)*.43,warpV=v+(m-.5)*.31;let field=1-(warpU*warpU*.89+warpV*warpV*1.21),edge=clamp((field-.05)*1.45,0,1);let tendril=clamp((m-.24)*2.1,0,1);let opacity=Math.pow(edge,2)*(.32+.68*tendril)*(0.56+0.44*n);
 let j=(y*s+xx)*4;im.data[j]=r[0];im.data[j+1]=r[1];im.data[j+2]=r[2];im.data[j+3]=Math.round(255*opacity*.8)
 }x.putImageData(im,0,0);return c}
const sprites=colors.map((_,i)=>create(i));let W=1,H=1,DPR=1,visible=true,raf=0,last=null,smoke=[],startTime=0;
function resize(){const r=atmo.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);DPR=Math.min(1.25,devicePixelRatio||1);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)}
resize();new ResizeObserver(resize).observe(atmo);
new IntersectionObserver(e=>{visible=!!e[0]?.isIntersecting;if(visible&&smoke.length&&!raf)raf=requestAnimationFrame(draw)},{threshold:0}).observe(atmo);
function puff(x,y,dx,dy,now,velocity){const side=Math.atan2(dy,dx)+Math.PI/2;const spread=28+Math.min(68,velocity*.30);let displacement=(rand()-.5)*spread*2;let color=Math.floor(rand()*sprites.length);
 smoke.push({x:x+Math.cos(side)*displacement,y:y+Math.sin(side)*displacement,t:now-rand()*90,duration:(isProcess?2400:1450)+rand()*(isProcess?900:750),size:(isProcess?39:35)+rand()*(isProcess?62:55),vx:(rand()-.5)*.15+dx*.012,vy:-.08-rand()*.15+dy*.004,ang:(rand()-.5)*2,turn:(rand()-.5)*.0012,alpha:.28+rand()*.18,sprite:sprites[color],phase:rand()*6.28})
 if(smoke.length>(isProcess?180:145))smoke.splice(0,smoke.length-(isProcess?180:145))
}
function move(e){if(e.pointerType==='touch'||document.hidden||!visible)return;const r=atmo.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 if(x<0||y<0||x>W||y>H){last=null;return}let now=performance.now();if(!last){last={x,y,t:now};return}
 let dx=x-last.x,dy=y-last.y,d=Math.hypot(dx,dy),dt=Math.max(1,now-last.t);if(d<4)return;
 // Large clusters with stochastic transverse diffusion eliminate the narrow glowing line.
 let count=Math.min(11,Math.max(4,Math.ceil(d/11)));let speed=d/dt*16;
 for(let i=0;i<count;i++){let u=(i+rand())/count;puff(last.x+dx*u,last.y+dy*u,dx/count,dy/count,now,speed);}
 last={x,y,t:now};debug.particles=smoke.length;if(!raf)raf=requestAnimationFrame(draw)
}
document.addEventListener('pointermove',move,{passive:true});document.addEventListener('scroll',()=>{last=null},{passive:true});
function draw(now){raf=0;if(!visible||document.hidden)return;ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='source-over';
 for(let i=smoke.length-1;i>=0;i--){let p=smoke[i],a=(now-p.t)/p.duration;if(a>=1){smoke.splice(i,1);continue}
 let grow=1.0+2.1*a,scale=p.size*grow,x=p.x+p.vx*(now-p.t)*.08+Math.sin(a*8+p.phase)*18*a,y=p.y+p.vy*(now-p.t)*.10-20*a+Math.cos(a*6+p.phase)*12*a;
 ctx.save();ctx.translate(x,y);ctx.rotate(p.ang+p.turn*(now-p.t));ctx.scale(1.2+.2*a,.76+.28*a);ctx.globalAlpha=p.alpha*Math.min(1,((now-p.t)/135)+.16)*Math.pow(1-a,1.5);ctx.drawImage(p.sprite,-scale,-scale,scale*2,scale*2);ctx.restore();
 }
 debug.particles=smoke.length;if(smoke.length)raf=requestAnimationFrame(draw)
}
debug.vapor='irregular-volumes';
})();
