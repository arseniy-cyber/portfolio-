/* Lumo's cinematic homepage: the scroll position is the camera timeline.
   Native scroll remains untouched. Render frames are interpolated for ice-like motion;
   scrolling backwards reverses every transform deterministically. */
(()=>{'use strict';
const root=document.querySelector('#lx-experience');if(!root)return;
const $=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const world=$('#world-stage'),header=$('#site-header'),dots=all('#progress-dots i');
const scenes={intro:$('#scene-intro'),gallery:$('#scene-gallery'),void:$('#scene-void'),device:$('#scene-device'),flight:$('#scene-flight'),process:$('#scene-process'),end:$('#scene-end')};
const camera=$('#intro-camera'),introLetter=$('#intro-letter'),introWhite=$('#intro-white'),galleryTrack=$('#project-track'),galleryViewport=$('#project-viewport'),galleryTitle=$('.gallery-head'),galleryCount=$('#gallery-count'),galleryCurrent=$('#gallery-current'),photo=all('.statue-photo'),voidPortal=$('.void-portal'),deviceModel=$('.device-model'),deviceCopy=$('.device-copy'),plane=$('.plane-model'),planeFallback=$('.plane-fallback'),trails=$('#engine-trails'),processWindow=$('.process-window'),processEditorial=$('.process-editorial'),endInner=$('.end-inner');
const cards=all('.rail-work');const labels=['Вступление','Портфолио','Переход','3D','Самолёт','Процесс','Контакт'];
const ease=(a,b,x)=>{let t=Math.max(0,Math.min(1,(x-a)/Math.max(.000001,b-a)));return t*t*(3-2*t)},clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),range=(a,b,c,d,x)=>ease(a,b,x)*(1-ease(c,d,x)),lerp=(a,b,t)=>a+(b-a)*t;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width:700px)');
const motion=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion: no-preference)').matches;
const sceneTimes=[['intro',0,.001,.16,.208],['gallery',.165,.207,.451,.535],['void',.477,.527,.562,.603],['device',.571,.602,.680,.732],['flight',.693,.721,.804,.843],['process',.794,.839,.915,.962],['end',.932,.975,1,1]];
const videos={intro:$('.intro-video'),void:$('.void-video'),device:$('.device-video'),flight:$('.flight-video'),end:$('.end-video')};
let target=0,current=0,raf=0,prevPos=-1,frameStamp=0,mouse={x:0,y:0},cursor=$('#cursor-smoke'),modelLoading=false,modelLoaded=false;
function sourceProgress(){const r=root.getBoundingClientRect();return clamp(-r.top/Math.max(1,root.offsetHeight-innerHeight));}
function setVisible(node,opacity){const a=clamp(opacity);node.style.opacity=a.toFixed(4);node.style.visibility=a>.004?'visible':'hidden';node.style.pointerEvents=a>.84?'auto':'none';node.classList.toggle('is-active',a>.08)}
function start3D(){if(window.LUMO_OFFLINE_PREVIEW||modelLoading||modelLoaded||reduced)return;modelLoading=true;
 const files=['assets/js/model-phone-data.js','assets/js/screen-data.js','assets/js/phone-screen-v6.js','assets/js/model-plane-data.js','assets/js/lumo-gltf-scenes.js'];
 (async()=>{try{for(const src of files){await new Promise((ok,fail)=>{const script=document.createElement('script');script.async=false;script.src=src;script.onload=ok;script.onerror=()=>fail(Error('Could not load '+src));document.body.append(script)})}modelLoaded=true;document.dispatchEvent(new Event('lumo-cinema-update'));}catch(e){console.warn('3D renderer unavailable; using fallback images',e)}finally{modelLoading=false}})();
}
const names=['Лав Парфюм','FORM / iPhone','mmrsiq ta2','Lumo Parfum','NOIR / DETAIL','Nik’s Tattoo','Сад кофе','SHURUBOR'];
const process=[
 ['Обсуждение','Выясняю задачу, настроение и функционал будущего сайта.'],
 ['Концепция','Подбираю структуру, композицию и подходящие способы движения.'],
 ['Разработка','Собираю адаптивный интерфейс и работающий функционал.'],
 ['Проверка','Проверяю основные сценарии, мобильный экран, заявки и детали.'],
 ['Передача','Публикация, исходники, доступы и дальнейшее сопровождение по договорённости.']
];
let currentStep=-1,currentGallery=-1;
let introAnchor={x:0,y:0};
function measureIntroAnchor(){
 const previous=camera.style.transform;camera.style.transform='none';
 const rect=introLetter.getBoundingClientRect(),w=world.clientWidth,h=world.clientHeight;
 introAnchor={x:rect.left+rect.width*.28,y:rect.top+rect.height*.46};
 camera.style.transformOrigin=`${introAnchor.x}px ${introAnchor.y}px`;
 camera.style.transform=previous;
}
measureIntroAnchor();

function render(p){const w=world.clientWidth,h=world.clientHeight,sm=mobile.matches;
 window.LUMO_CINEMA_PROGRESS=p;
 // The camera flies into the L. The entire intro world is scaled, not only the letter.
 const zoom=ease(.075,.188,p);
 const camScale=1+(sm?76:55)*zoom;
 camera.style.transform=`translate3d(${((w/2-introAnchor.x)*zoom).toFixed(2)}px,${((h/2-introAnchor.y)*zoom).toFixed(2)}px,0) scale(${camScale.toFixed(4)})`;
 introWhite.style.opacity=String(ease(.16,.194,p));
 $('#scroll-hint').style.opacity=String(1-ease(.035,.1,p));
 setVisible(scenes.intro,1-ease(.18,.208,p));
 // First small white letter fills the viewport before the next scene appears.
 setVisible(scenes.gallery,range(.168,.208,.442,.527,p));
 const galleryLocal=clamp((p-.211)/.234);
 const maxTravel=Math.max(0,galleryTrack.scrollWidth-galleryViewport.clientWidth);
 const travel=galleryLocal*maxTravel;
 galleryTrack.style.transform=`translate3d(${-travel.toFixed(1)}px,0,0)`;
 cards.forEach((card,i)=>{
  const d=(i-galleryLocal*7),angle=clamp(d,-2,2)*(sm?-2.2:-1.2);
  card.style.setProperty('--card-angle',`${angle.toFixed(3)}deg`);
  // Art-directed spatial rail: the focused work comes forward, neighbours recede
  // without random overlap or crossing one another.
  const focus=1-ease(.12,1.15,Math.abs(d));
  const depth=(focus*35-35),scale=.94+focus*.06;
  const drift=Math.sin((galleryLocal*8-i)*1.25)*7;
  card.style.transform=`translate3d(0,${drift.toFixed(1)}px,${depth.toFixed(1)}px) rotateZ(${angle.toFixed(3)}deg) rotateY(${(-d*1.5).toFixed(2)}deg) scale(${scale.toFixed(4)})`;
  card.style.opacity=String(clamp(.86+focus*.14,.86,1));
 });
 const i=clamp(Math.round(galleryLocal*7),0,7);
 if(i!==currentGallery){currentGallery=i;galleryCount.textContent=String(i+1).padStart(2,'0')+' / 08';galleryCurrent.textContent=names[i]}
 photo.forEach((f,i)=>{const drift=(i%2?1:-1)*(galleryLocal*70);const zoom=1.30+.18*Math.sin(galleryLocal*3.7+i);f.style.transform=`translate3d(${drift.toFixed(1)}px,${(galleryLocal*(i+1)*-30).toFixed(1)}px,0) scale(${zoom.toFixed(3)})`;f.style.opacity=String(clamp(.31-Math.abs(galleryLocal-(i/3))*.11,.10,.35))});
 galleryTitle.style.transform=`translate3d(0,${(-26*ease(.35,.44,p)).toFixed(1)}px,0)`;
 const exit=ease(.440,.531,p);
 scenes.gallery.style.transform=`translate3d(0,${(-h*.08*exit).toFixed(1)}px,0) rotateZ(${(-5.2*exit).toFixed(2)}deg) scale(${(1-exit*.92).toFixed(4)})`;
 scenes.gallery.style.boxShadow=exit>.02?'0 40px 120px #e8eee25d':'none';
 // The darker green tunnel is already behind the shrinking gallery, no black flash.
 setVisible(scenes.void,range(.457,.51,.568,.61,p));
 const portalIn=ease(.485,.566,p);
 voidPortal.style.transform=`translate3d(0,${((1-portalIn)*90).toFixed(1)}px,0) scale(${(.89+portalIn*.11).toFixed(4)})`;
 setVisible(scenes.device,range(.567,.604,.682,.735,p));
 const deviceIn=ease(.567,.622,p);
 deviceCopy.style.transform=`translate3d(${((1-deviceIn)*-70).toFixed(1)}px,${((1-deviceIn)*50).toFixed(1)}px,0)`;
 deviceModel.style.transform=`translate3d(${((1-deviceIn)*100).toFixed(1)}px,${(-25*ease(.65,.71,p)).toFixed(1)}px,0) scale(${(.84+deviceIn*.16).toFixed(3)})`;
 const feature=clamp(Math.floor(((p-.589)/.105)*3),0,2);all('.device-metric').forEach((el,j)=>el.classList.toggle('is-current',j===feature));
 // Flight is the foreground occluder; next scene is already present underneath.
 setVisible(scenes.process,range(.800,.840,.918,.964,p));
 setVisible(scenes.flight,range(.688,.722,.800,.841,p));
 const t=ease(.695,.816,p),bank=ease(.743,.800,p);
 planeFallback.style.transform=`translate3d(${((-110+122*t)*w/100).toFixed(1)}px,${((9-16*t)*h/100).toFixed(1)}px,0) rotate(${(-9+49*bank).toFixed(2)}deg) scale(${(.18+6.0*ease(.731,.814,p)).toFixed(3)})`;
 trails.style.opacity=String(range(.70,.74,.8,.842,p)*.74);
 trails.style.transform=`translate3d(${(-15+80*t).toFixed(2)}vw,${(8-9*t).toFixed(2)}vh,0) rotate(${(-10+33*bank).toFixed(2)}deg)`;
 $('.flight-copy').style.opacity=String(1-ease(.749,.795,p));
 // Process combines deliverables and trust; text updates are a real scroll step machine.
 const processIn=ease(.799,.848,p);
 processEditorial.style.transform=`translate3d(${((-75*(1-processIn)).toFixed(1))}px,0,0)`;
 processWindow.style.transform=`perspective(1100px) rotateY(${(-16+12*processIn).toFixed(2)}deg) rotateX(${(8-5*processIn).toFixed(2)}deg) translateY(${((1-processIn)*80).toFixed(1)}px)`;
 const step=clamp(Math.floor((p-.831)/.090*5),0,4);
 if(step!==currentStep){currentStep=step;$('#process-count').textContent=String(step+1).padStart(2,'0');$('#process-heading').textContent=process[step][0];$('#process-description').textContent=process[step][1]}
 setVisible(scenes.end,ease(.928,.972,p));
 endInner.style.transform=`translate3d(0,${((1-ease(.93,.977,p))*110).toFixed(1)}px,0)`;
 // Contrast follows actual scene, not a fixed timer.
 const onLight=(p>=.174&&p<.502)||(p>=.814&&p<.947);
 header.classList.toggle('on-light',onLight);document.body.classList.toggle('on-light',onLight);
 header.classList.toggle('scrolled',false);
 const chapter=p<.166?0:p<.466?1:p<.565?2:p<.691?3:p<.808?4:p<.935?5:6;
 dots.forEach((d,j)=>d.classList.toggle('active',j===chapter));
 // Avoid decoding invisible video layers. Start at least one scene early.
 for(const [name,video] of Object.entries(videos)){
  const s=scenes[name],active=s.classList.contains('is-active');
  if(active){if(video.paused){const r=video.play();if(r&&r.catch)r.catch(()=>{})}}else if(!video.paused){video.pause()}
 }
 if(p>.51&&!modelLoaded&&!modelLoading)start3D();
 document.dispatchEvent(new Event('lumo-cinema-update'));
}
function animate(t){raf=0;const delta=Math.min(.065,Math.max(0.005,(t-frameStamp)/1000||.016));frameStamp=t;target=sourceProgress();
 // Exponential response is smooth without locking native scrolling, and always
 // converges on the exact scroll state when the finger or mouse stops.
 const response=reduced?1:1-Math.exp(-delta*(mobile.matches?22:20));
 current=lerp(current,target,response);
 if(Math.abs(current-target)<.000035)current=target;
 render(current);
 if(Math.abs(current-target)>.000035)schedule();
}
function schedule(){if(!raf)raf=requestAnimationFrame(animate)}
if(reduced){render(0);return;}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{measureIntroAnchor();schedule()},{passive:true});addEventListener('pageshow',schedule,{passive:true});
if(motion&&cursor){addEventListener('pointermove',e=>{cursor.style.opacity=.66;cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'},{passive:true});addEventListener('pointerleave',()=>{cursor.style.opacity=0})}
if(document.fonts?.ready)document.fonts.ready.then(()=>{measureIntroAnchor();schedule()}).catch(()=>{});
// Initial render even if restored partway down after returning from a case.
target=sourceProgress();current=target;render(current);
window.LUMO_JOURNEY_DEBUG=()=>({progress:current,target,scene:labels[Math.min(6,dots.findIndex(d=>d.classList.contains('active')))],project:galleryCurrent?.textContent,modelLoaded,scene3d:window.LUMO_3D_DEBUG?.()});
})();
