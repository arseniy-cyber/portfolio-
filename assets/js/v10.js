/* Lumo Sites V10 — V8 cinema; borrowed V9 book mechanics, tuned and isolated. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
// V9-inspired sequential printed pages, with a single physically turning overlay.
const book=document.querySelector('.v10-storybook');
if(book){
 const pages=[...book.querySelectorAll('.storybook__page')];const prev=book.querySelector('[data-story="prev"]');const next=book.querySelector('[data-story="next"]');const status=book.querySelector('[data-story-status]');let current=0,busy=false;
 function sync(){pages.forEach((p,i)=>{p.classList.toggle('is-active',i===current);p.setAttribute('aria-hidden',String(i!==current));});if(status)status.textContent=`${String(current+1).padStart(2,'0')} / ${String(pages.length).padStart(2,'0')}`;}
 function flip(direction){if(busy||pages.length<2)return;busy=true;const old=pages[current];const target=(current+direction+pages.length)%pages.length;prev.disabled=true;next.disabled=true;
  // Underlying sheet appears only after the top sheet begins turning — no duplicate text.
  const overlay=old.cloneNode(true);overlay.classList.add('v10-turn-sheet',direction>0?'is-next':'is-prev');overlay.removeAttribute('data-page');overlay.removeAttribute('data-v8-page');overlay.removeAttribute('aria-hidden');overlay.setAttribute('aria-hidden','true');
  current=target;sync();book.insertBefore(overlay,book.querySelector('.storybook__controls'));
  const finish=()=>{overlay.remove();busy=false;prev.disabled=false;next.disabled=false;};
  if(reduce){finish();return;}
  overlay.addEventListener('animationend',finish,{once:true});setTimeout(()=>{if(overlay.isConnected)finish();},900);
 }
 prev?.addEventListener('click',()=>flip(-1));next?.addEventListener('click',()=>flip(1));
 book.addEventListener('keydown',e=>{if(e.target.closest('button')&&e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();flip(e.key==='ArrowRight'?1:-1);}});
 let startX=null;book.addEventListener('touchstart',e=>{startX=e.touches[0]?.clientX??null;},{passive:true});book.addEventListener('touchend',e=>{if(startX===null)return;const dx=(e.changedTouches[0]?.clientX??startX)-startX;startX=null;if(Math.abs(dx)>65)flip(dx<0?1:-1);},{passive:true});
 sync();
}
// Procedural full-viewport atmospheric volumes (independent palette for each page).
// The canvas is a decorative layer only. Content/navigation never depends on WebGL.
const layer=document.querySelector('.v10-atmosphere[data-v10-atmosphere]');
if(layer){document.addEventListener('pointermove',e=>{const x=clamp(e.clientX/innerWidth),y=clamp(e.clientY/innerHeight);layer.style.setProperty('--v10-x',(x*100).toFixed(1)+'%');layer.style.setProperty('--v10-y',(y*100).toFixed(1)+'%');layer.style.setProperty('--v10-flow-x',((x-.5)*78).toFixed(1)+'px');layer.style.setProperty('--v10-flow-y',((y-.5)*64).toFixed(1)+'px');},{passive:true});}
const palette={
 works:[[.052,.18,.14],[.48,.16,.28],[.12,.34,.26],1.2],
 process:[[.045,.16,.13],[.39,.14,.25],[.19,.36,.30],2.25],
 lab:[[.028,.16,.17],[.42,.15,.30],[.13,.37,.37],3.4],
 contact:[[.045,.16,.13],[.54,.15,.28],[.16,.35,.29],4.55],
 about:[[.043,.14,.12],[.43,.18,.27],[.14,.27,.22],5.7],
 services:[[.045,.15,.12],[.50,.17,.28],[.17,.29,.26],6.9]
};
let smokeReady=false;
if(layer&&!reduce&&!matchMedia('(max-width:760px)').matches&&!['about','process'].includes(layer.dataset.v10Atmosphere)){
 const canvas=layer.querySelector('canvas');let gl=null;
 try{gl=canvas.getContext('webgl',{alpha:false,depth:false,antialias:false,preserveDrawingBuffer:false,powerPreference:'low-power'});}catch(e){}
 if(gl){
 const vs='attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}';
 const fs=`precision highp float;
uniform vec2 uRes,uMouse;uniform float uTime,uSeed;uniform vec3 uBase,uWine,uMoss;
float hash21(vec2 p){p=fract(p*vec2(.1031,.103));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash21(i),hash21(i+vec2(1.,0.)),f.x),mix(hash21(i+vec2(0.,1.)),hash21(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.54,v=0.;for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.11+vec2(7.7,19.3);a*=.49;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes,asp=vec2(uRes.x/uRes.y,1.);vec2 q=(uv-.5)*asp;
 float t=uTime*.18, seed=uSeed;vec2 focus=(uMouse-.5)*asp,delta=q-focus;
 float influence=exp(-dot(delta,delta)*6.8);
 vec2 p=q*2.35+vec2(seed*.72,-seed*.30);
 float swirl=fbm(p*.87+vec2(t*.62,-t*.31));
 p+=vec2(sin(p.y*1.8+t),cos(p.x*2.-t*.74))*.12;
 p+=vec2(-delta.y,delta.x)*influence*(.64+.25*sin(t*2.7));
 p+=vec2(swirl-.35,-swirl+.39)*.37;
 float fog=fbm(p*1.27+vec2(-t*.83,t*.45));
 float vein=noise(p*3.2+vec2(.8*t,-t*.34));
 float shape=smoothstep(.26,.70,fog+.24*vein);
 float wisps=smoothstep(.42,.76,fog+vein*.15)*.12;
 float winePulse=.5+.36*sin(t*.64+q.x*2.5+fog*5.+seed*.8);
 vec3 smoke=mix(uMoss*1.35,uWine*1.65,clamp(winePulse+(.5-fog)*.32,0.,1.));
 float vignette=clamp(1.-dot(q,q)*.36,.55,1.);
 vec3 col=uBase+smoke*(shape*.94+wisps)*vignette;
 col+=uWine*(influence*(.12+shape*.23));
 col+=uMoss*max(0.,fog-.5)*.28;
 gl_FragColor=vec4(col,1.);
}`;
 function compile(type,code){const sh=gl.createShader(type);gl.shaderSource(sh,code);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));return sh;}
 try{
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const positions=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,positions);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'aPos');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['uRes','uMouse','uTime','uSeed','uBase','uWine','uMoss'].map(k=>[k,gl.getUniformLocation(program,k)]));const [a,b,c,seed]=palette[layer.dataset.v10Atmosphere]||palette.works;
 gl.uniform3fv(uniforms.uBase,new Float32Array(a));gl.uniform3fv(uniforms.uWine,new Float32Array(b));gl.uniform3fv(uniforms.uMoss,new Float32Array(c));gl.uniform1f(uniforms.uSeed,seed);
 let mx=.5,my=.5,x=.5,y=.5,raf=0,last=0,active=true,quality=.91,frameSum=0,frameSamples=0;const start=performance.now();
 document.addEventListener('pointermove',e=>{const r=layer.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;mx=clamp((e.clientX-r.left)/Math.max(1,r.width));my=1-clamp((e.clientY-r.top)/Math.max(1,r.height));},{passive:true});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&active&&raf===0)raf=requestAnimationFrame(draw);});
 addEventListener('scroll',()=>{if(window.scrollY<innerHeight*1.15&&!raf&&!document.hidden&&active)raf=requestAnimationFrame(draw);},{passive:true});
 const observer=new IntersectionObserver(es=>{active=!!es[0]?.isIntersecting;if(active&&!document.hidden&&!raf)raf=requestAnimationFrame(draw);},{threshold:0});observer.observe(layer);
 function draw(now){raf=0;if(document.hidden||!active||window.scrollY>innerHeight*1.15)return;const delta=now-last;if(delta<15.9){raf=requestAnimationFrame(draw);return;}last=now;if(delta<120){frameSum+=delta;frameSamples++;if(frameSamples>=32){const avg=frameSum/frameSamples;if(avg>27)quality=Math.max(.58,quality-.07);else if(avg<20)quality=Math.min(.91,quality+.025);frameSamples=0;frameSum=0;}}
  const rect=canvas.getBoundingClientRect(),scale=Math.min(quality,Math.sqrt(1100000/Math.max(1,rect.width*rect.height)));const w=Math.max(1,Math.round(rect.width*scale)),h=Math.max(1,Math.round(rect.height*scale));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);x+=(mx-x)*.22;y+=(my-y)*.22;gl.uniform2f(uniforms.uMouse,x,y);gl.uniform2f(uniforms.uRes,w,h);gl.uniform1f(uniforms.uTime,(now-start)/1000);gl.drawArrays(gl.TRIANGLES,0,6);raf=requestAnimationFrame(draw);
 }
 smokeReady=true;layer.classList.add('has-smoke-webgl');raf=requestAnimationFrame(draw);
 }catch(e){console.warn('V10 atmospheric fallback:',e);canvas.style.display='none';}
 }else{canvas.style.display='none';}
}
// Stronger keyboard signals and compact service card controls; do not hijack native scroll.
for(const card of document.querySelectorAll('.service-flip')){
 const btn=card.querySelector('.service-flip__toggle');if(!btn)continue;btn.textContent='';btn.setAttribute('aria-label','Подробнее об услуге');
 btn.addEventListener('click',()=>{requestAnimationFrame(()=>btn.setAttribute('aria-label',card.classList.contains('is-flipped')?'Показать лицевую сторону':'Подробнее об услуге'));});
}
// Update contact form's already-operational V7 dropdown when service preselected via query.
const service=document.querySelector('#service-select');const dropdown=document.querySelector('.premium-select[data-enhanced-dropdown]');
if(service&&dropdown){const label=dropdown.querySelector('.premium-select__trigger span');const chosen=()=>{const selected=service.selectedOptions?.[0];if(selected?.value&&label)label.textContent=selected.textContent;};service.addEventListener('change',chosen);chosen();}
window.LUMO_V10_DEBUG={version:'10.0',base:'V8',bookSource:'V9',bookPages:book?.querySelectorAll('.storybook__page:not(.v10-turn-sheet)').length||0,smokeReady,smokeTheme:layer?.dataset.v10Atmosphere||null,serviceCards:document.querySelectorAll('.service-flip').length};
})();
