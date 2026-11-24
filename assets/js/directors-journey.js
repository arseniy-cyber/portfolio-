/* Lumo Sites Director's Cut. One deterministic scroll driven scene timeline.
   Scroll back to rewind each camera, orbit and flight operation. */
(()=>{'use strict';
const root=document.querySelector('#lx-experience');if(!root)return;
const $=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const world=$('#world-stage'),header=$('#site-header');
const scenes={intro:$('#scene-intro'),gallery:$('#scene-gallery'),void:$('#scene-void'),device:$('#scene-device'),flight:$('#scene-flight'),process:$('#scene-process'),end:$('#scene-end')};
const camera=$('#intro-camera'),introRest=$('#intro-rest'),introLetter=$('#intro-letter-rest'),introWhite=$('#intro-white');
const restWord=introRest.querySelector('.intro-word'),restCopy=introRest.querySelector('.intro-first');
let flightRenderer=null; const planeMobile=()=>mobile.matches||matchMedia('(pointer:coarse) and (max-height:600px)').matches;
const galleryTrack=$('#project-track'),galleryViewport=$('#project-viewport'),galleryTitle=$('.gallery-head'),galleryCount=$('#gallery-count'),galleryCurrent=$('#gallery-current'),photos=all('.statue-photo'),cards=all('.rail-work');
const deviceModel=$('.device-model'),deviceCopy=$('.device-copy'),deviceUIs=all('.floating-ui'),plane=$('.plane-model'),planeFallback=$('.plane-fallback'),trails=$('#engine-trails'),processEditorial=$('.process-editorial'),orbit=$('#process-orbit'),orbitCards=all('.orbit-card'),endInner=$('.end-inner');
const mobile=matchMedia('(max-width:700px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const videos={intro:$('.intro-video'),void:$('.void-video'),device:$('.device-video'),flight:$('.flight-video'),process:$('.qa6-orbit-film'),end:$('.end-video')};
const names=['Лав Парфюм / FORM','mmrsiq ta2 / Lumo Parfum','NOIR / DETAIL / Nik’s Tattoo','Сад кофе / SHURUBOR'];
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a||1));return t*t*(3-2*t)};
const band=(a,b,c,d,p)=>smooth(a,b,p)*(1-smooth(c,d,p));
const lerp=(a,b,t)=>a+(b-a)*t;
let target=0,current=0,lastTime=0,raf=0,modelLoading=false,modelLoaded=false,lastPair=-1,lastOrbit=-1;
let anchor={x:0,y:0};const mediaStates=new WeakMap();function playScene(video,active){if(!video)return;let st=mediaStates.get(video);if(!st){st={active:false,pending:false,failed:false};mediaStates.set(video,st)}if(!active){if(st.active||!video.paused)video.pause();st.active=false;st.failed=false;return}if(!st.active){st.active=true;st.failed=false;video.muted=true;video.defaultMuted=true;video.playsInline=true;}if(!video.paused||st.pending||st.failed)return;st.pending=true;Promise.resolve(video.play()).catch(()=>{st.failed=true}).finally(()=>{st.pending=false;if(!st.active)video.pause()})}function retryMedia(){for(const v of Object.values(videos)){if(!v)continue;const st=mediaStates.get(v);if(st?.active){st.failed=false;playScene(v,true)}}}addEventListener("touchend",retryMedia,{passive:true});addEventListener("pointerup",retryMedia,{passive:true});
 // Two independent gates. Input requests a transition; time, not wheel distance,
 // determines every subsequent animation frame in either direction.
 const gates=[{name:'intro',from:0,to:.286,duration:2300,backDuration:1900},{name:'flight',from:.660,to:.823,duration:4200},{name:'sand',from:.936,to:.958,duration:1850,backDuration:1700}];
 const flightTo=gates.find(g=>g.name==='flight').to;
 const sandTo=gates.find(g=>g.name==='sand').to;
 const mobileViewport=()=>mobile.matches||matchMedia('(pointer:coarse) and (max-height:600px)').matches;
 const gateTolerance=()=>Math.max(.00012, (mobileViewport()?9:2)/spanHeight());
 function snapEndpoint(p){const tolerance=gateTolerance();for(const g of gates)if(Math.abs(p-g.to)<=tolerance)return g.to;return p;}
 let activeGate=null,previousSource=0,flightDone=false,flightAuto=null;
 let touchStartY=null,touchStartX=null,touchDirection=null, modelGesture=false;let lastViewW=innerWidth,lastViewH=innerHeight,resizeUntil=0, lastSpan=0, resizeHold=0;
 const spanHeight=()=>Math.max(1,root.offsetHeight-world.clientHeight);
 function scrollProgress(p){const rect=root.getBoundingClientRect(),span=spanHeight();window.scrollTo({top:scrollY+rect.top+p*span,behavior:'instant'})}
 function startGate(g,reverse,t){if(activeGate)return false;const preStart=g.name==='sand'?g.from:Math.max(g.from-.04,Math.min(g.from,current));const preDuration=!reverse&&g.name==='sand'?140:!reverse&&g.name==='flight'&&preStart<g.from-.002?360:0;activeGate={g,reverse,start:t,preStart,preDuration};flightAuto=g.name==='flight'?activeGate:null;current=reverse?g.to:preDuration?preStart:g.from;target=current;previousSource=current;document.body.classList.add('qa5-transition-running');document.body.dataset.transition=g.name;document.body.dataset.direction=reverse?'back':'forward';scrollProgress(current);render(current);if(g.name==='sand'&&!reverse)activeGate.start=performance.now();schedule();return true;}
 function gateTick(t,raw){
  if(activeGate){const {g,reverse,start,preStart}=activeGate;let preDuration=activeGate.preDuration;const elapsed=t-start;if(g.name==='sand'&&!reverse&&elapsed>=preDuration&&elapsed<420&&document.querySelector('.qa5-sand')?.dataset.captureReady==='0'){preDuration=activeGate.preDuration=Math.min(420,elapsed+20)}if(preDuration&&elapsed<preDuration){const p=lerp(preStart,g.from,smooth(0,preDuration,elapsed));current=p;scrollProgress(p);render(p);schedule();return true}const a=clamp((elapsed-preDuration)/(reverse?(g.backDuration||g.duration):g.duration));const p=reverse?lerp(g.to,Math.max(0,g.from-.00012),a):lerp(g.from,g.to,a);current=p;scrollProgress(p);render(p);if(a>=1){activeGate=null;flightAuto=null;flightDone=p>=flightTo;document.body.classList.remove('qa5-transition-running');delete document.body.dataset.transition;delete document.body.dataset.direction;target=p;previousSource=p;scrollProgress(p);schedule()}else schedule();return true;}
  // Crossing a gate is detected even if a wheel/trackpad sends a large delta.
  const forward=raw>previousSource+.000015,back=raw<previousSource-.000015;
  if(forward){for(const g of gates){if(previousSource<g.from+.0001&&raw>=g.from)return startGate(g,false,t);}}
  if(back){for(const g of [...gates].reverse()){if(previousSource>=g.to-gateTolerance()&&raw<g.to-gateTolerance())return startGate(g,true,t);}}
  // Never allow a settled scroll position inside a cinematic gate.
  for(const g of gates){if(raw>g.from&&raw<g.to-gateTolerance()){return startGate(g,back||(!forward&&raw>(g.from+g.to)/2),t)}}
  previousSource=raw;flightDone=raw>=flightTo-.00015;return false;
 }
 function requestInput(direction,distance){syncViewport();if(performance.now()<resizeUntil&&!activeGate)return false;if(activeGate)return true;const p=source();const span=spanHeight(),reach=Math.max(80,distance*1.25)/span;const candidates=direction>0?gates:[...gates].reverse();for(const g of candidates){if(direction>0&&p>=g.from-reach&&p<g.from+.0001)return startGate(g,false,performance.now());if(direction<0&&p<=g.to+reach&&p>=g.to-.0005)return startGate(g,true,performance.now())}return false;}
 const labels=['Вступление','Портфолио','Межпространство','3D','Самолёт','Процесс','Финал'];
function measureAnchor(){
 const old=camera.style.transform,oldWord=restWord.style.transform,oldOrigin=restWord.style.transformOrigin,oldCopy=restCopy.style.transform,oldCopyOrigin=restCopy.style.transformOrigin;camera.style.transform='none';restWord.style.removeProperty('transform');restWord.style.removeProperty('transform-origin');restCopy.style.removeProperty('transform');restCopy.style.removeProperty('transform-origin');
 const r=introLetter.getBoundingClientRect(),wr=world.getBoundingClientRect();
 const svg=introLetter.querySelector('svg'), m=svg?.getScreenCTM();
 const point=m?new DOMPoint(23,58).matrixTransform(m):{x:r.left+r.width*.23,y:r.top+r.height*.49};
 const unit=m?Math.min(Math.abs(m.a),Math.abs(m.d)):r.width/100;
 anchor.x=point.x-wr.left;anchor.y=point.y-wr.top;
 const wordRect=restWord.getBoundingClientRect();anchor.wordX=point.x-wordRect.left;anchor.wordY=point.y-wordRect.top;const copyRect=restCopy.getBoundingClientRect();anchor.copyX=point.x-copyRect.left;anchor.copyY=point.y-copyRect.top;
 anchor.zoom=Math.max(wr.width/(unit*20),wr.height/(unit*100))*1.20;
 camera.style.transformOrigin=`${anchor.x}px ${anchor.y}px`;
 camera.style.transform=old;if(oldWord)restWord.style.setProperty('transform',oldWord,'important');if(oldOrigin)restWord.style.transformOrigin=oldOrigin;if(oldCopy)restCopy.style.setProperty('transform',oldCopy,'important');if(oldCopyOrigin)restCopy.style.transformOrigin=oldCopyOrigin;
}
function set(node,opacity,enable=true){
 if(!node)return;
 const a=clamp(opacity);
 node.style.opacity=a.toFixed(4);
 node.style.visibility=a>.003?'visible':'hidden';
 node.style.pointerEvents=enable&&a>.96?'auto':'none';
 node.classList.toggle('is-active',a>.08);
}
function start3D(){
 if(window.LUMO_OFFLINE_PREVIEW||reduced||modelLoading||modelLoaded)return;
 // Do not download fourteen megabytes of model scripts on a device without WebGL.
 if(document.createElement){try{const probe=document.createElement('canvas'),ctx=probe.getContext('webgl');if(!ctx){modelLoaded=true;document.body.classList.add('lumo-no-webgl');return}ctx.getExtension('WEBGL_lose_context')?.loseContext()}catch(_){modelLoaded=true;document.body.classList.add('lumo-no-webgl');return}}
 modelLoading=true;
 const loadScript=src=>new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.async=false;el.onload=resolve;el.onerror=()=>reject(new Error(src+' not found'));document.body.append(el)});
 (async()=>{try{
  // On an HTTP deployment, fetch original binary models directly. File previews retain the embedded fallback.
  let binary=false;
  if(/^https?:$/.test(location.protocol)){try{const files={phone:'phone-original.glb',airliner:'airliner-flight.glb',orbit:'orbit-chosen.glb'};const data=await Promise.all(Object.entries(files).map(async ([kind,name])=>{const response=await fetch('assets/models/'+name,{cache:'force-cache'});if(!response.ok)throw Error(name);const bytes=await response.arrayBuffer();if(new DataView(bytes).getUint32(0,true)!==0x46546c67)throw Error('Invalid '+name);return [kind,bytes]}));window.LUMO_ORIGINAL_GLB=Object.fromEntries(data);binary=true;}catch(e){console.warn('Binary model loading unavailable; using local compatibility data',e)}}
  if(!binary){for(const src of ['assets/js/model-phone-data.js','assets/js/model-plane-data.js','assets/js/model-orbit-data.js'])await loadScript(src)}
  await loadScript('assets/js/phone-screen-v6.js');await loadScript('assets/js/lumo-gltf-scenes.js');
  modelLoaded=true;document.dispatchEvent(new Event('lumo-cinema-update'));
 }catch(e){console.warn('3D renderer unavailable, static fallback will remain',e)}finally{modelLoading=false}})();
}
function render(p){
 window.LUMO_CINEMA_PROGRESS=p;
 const w=world.clientWidth,h=world.clientHeight,sm=mobile.matches;
 // 3+ viewport lengths to enter the white L slowly.
 const approach=smooth(.004,.246,p);
 const scale=Math.exp(Math.log(anchor.zoom||40)*approach);
 const zooming=p>.004&&p<.253;
 // Desktop: move the genuine logo and copy instead of rasterising an entire
 // oversized camera layer. Keep the same DOM content for both directions.
 if(!planeMobile()){
  introRest.hidden=false;introRest.inert=zooming;
  camera.classList.remove('qa11-zooming');camera.style.transform='none';
  // One shared projection for all typography. Slower initial push keeps the
  // full composition in frame for longer on the return. The copy is never
  // independently faded or swapped in at rest.
  const push=smooth(.004,.246,p), desktopApproach=push*push;
  const zoom=Math.exp(Math.log(anchor.zoom||40)*desktopApproach);
  const dx=(w*.5-anchor.x)*desktopApproach,dy=(h*.5-anchor.y)*desktopApproach;
  const translation=`translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px)`;
  restWord.style.transformOrigin=`${anchor.wordX||0}px ${anchor.wordY||0}px`;
  restWord.style.setProperty('transform',zooming?`${translation} translateY(-50%) scale(${zoom.toFixed(4)})`:'translateY(-50%)','important');
  restCopy.style.transformOrigin=`${anchor.copyX||0}px ${anchor.copyY||0}px`;
  restCopy.style.setProperty('transform',zooming?`${translation} translateX(-50%) scale(${zoom.toFixed(4)})`:'translateX(-50%)','important');
  restCopy.style.setProperty('opacity','1','important');
 }else{
  restWord.style.removeProperty('transform');restWord.style.removeProperty('transform-origin');restCopy.style.removeProperty('transform');restCopy.style.removeProperty('transform-origin');restCopy.style.removeProperty('opacity');
  introRest.hidden=zooming;introRest.inert=zooming;
  camera.classList.toggle('qa11-zooming',zooming);
  camera.style.transform=zooming?`translate(${((w*.5-anchor.x)*approach).toFixed(2)}px,${((h*.5-anchor.y)*approach).toFixed(2)}px) scale(${scale.toFixed(4)})`:'none';
  camera.style.setProperty('--intro-t',smooth(.07,.195,p).toFixed(3));
 }
 introWhite.style.opacity=0;
 const hint=$('#scroll-hint');if(hint)hint.style.opacity=(1-smooth(.08,.20,p)).toFixed(4);
 set(scenes.intro,p<.253?1:0);
 // 4 composed pairs of projects fly in from opposing sides. No random overlap.
 set(scenes.gallery,p>=.253?1-smooth(.49,.562,p):0);
 const section=clamp((p-.270)/.225);
 const activePair=Math.min(3,Math.floor(section*4));
 galleryTrack.style.transform='none';
 cards.forEach((card,i)=>{
  const pair=Math.floor(i/2),phase=sm?section*8-i:section*4-pair;
  const appear=sm?smooth(-.19,.24,phase):smooth(.03,.28,phase), leave=sm?smooth(.78,1.25,phase):smooth(.75,.97,phase);
  const alpha=appear*(1-leave),fromRight=i%2===1,side=fromRight?1:-1;
  const incoming=1-appear;
  const outgoing=leave;
  const distance=(sm?w*.64:w*.48);
  // Each card enters on a reserved lane. They never cross through another live card.
  const dx=side*incoming*distance+side*outgoing*distance*.36;
  const dy=(fromRight?-1:1)*incoming*h*.14-outgoing*h*.09;
  const z=-incoming*220-outgoing*170;
  const rotation=side*incoming*18-side*outgoing*9;
  const live=alpha>.006;
  card.style.opacity=alpha.toFixed(4);
  card.style.visibility=live?'visible':'hidden';
  card.style.pointerEvents=alpha>.93?'auto':'none';
  card.style.zIndex=String(50+pair);
  card.style.transform=`translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${rotation.toFixed(2)}deg) rotateZ(${(incoming*side*2.5).toFixed(2)}deg)`;
 });
 if(activePair!==lastPair){lastPair=activePair;if(galleryCount)galleryCount.textContent='';if(galleryCurrent)galleryCurrent.textContent=names[activePair]}
 photos.forEach((img,i)=>{
  // Alternating transparent sculpture photographs, never a ten-image collage.
  // Five different two-sculpture sets cover the four portfolio chapters.
  const group=Math.floor(i/2),side=i%2;
  const focus=(group+.5)/5;
  const reach=Math.abs(section-focus);
  const alpha=(1-smooth(.072,.155,reach))*(side?.29:.38);
  const scrollDrift=(section-focus)*205;
  img.style.opacity=alpha.toFixed(4);
  img.style.transform=`translate3d(${(scrollDrift*(side?-1:1)).toFixed(1)}px,${(scrollDrift*.67).toFixed(1)}px,0) scale(${(1.04+section*.05).toFixed(3)}) rotate(${(scrollDrift*.012).toFixed(2)}deg)`;
 });
 galleryTitle.style.transform='translate3d(0,0,0)';
 const exit=smooth(.474,.566,p);
 scenes.gallery.style.transform=`translate3d(0,${(-h*.05*exit).toFixed(1)}px,0) rotateZ(${(-2.4*exit).toFixed(2)}deg) scale(${(1-exit*.955).toFixed(4)})`;
 scenes.gallery.style.borderRadius=`${(exit*80).toFixed(1)}px`;
 // Tunnel is pure transition; no title and no regular section copy.
 set(scenes.void,band(.456,.493,.570,.620,p));
 const tunnelZoom=smooth(.456,.620,p);
 const tunnelVideo=videos.void;
 tunnelVideo.style.transform=`scale(${(1+tunnelZoom*.42).toFixed(3)})`;
 // Device occupies its own coherent visual world, not the tunnel video.
 set(scenes.device,p<.817? smooth(.571,.620,p):0);
 const reveal=smooth(.575,.624,p);
 deviceCopy.style.transform=`translate3d(${((1-reveal)*-65).toFixed(1)}px,0,0)`;
 deviceModel.style.transform=`translate3d(${((1-reveal)*70).toFixed(1)}px,${(-12*smooth(.671,.702,p)).toFixed(1)}px,0) scale(${(.88+.12*reveal).toFixed(3)}) ${deviceModel.classList.contains('has-webgl')?'':`rotateY(${(12-32*smooth(.618,.694,p)).toFixed(1)}deg)`}`;
 deviceUIs.forEach((ui,i)=>{
  const u=smooth(.580+i*.009,.630+i*.009,p),departure=smooth(.751,.790,p);
  const dx=sm?0:(1-u)*24;
  ui.style.opacity=(u*(1-departure)).toFixed(3);
  ui.style.transform=`translate3d(${dx.toFixed(2)}px,${((1-u)*(sm?18:42)).toFixed(2)}px,0) rotate(0deg)`;
 });
 // Plane is foreground physical occluder. Page behind it changes in one discrete cut.
 const flightStart=.660, cut=.817, release=.823;
 const isPlane=p>=flightStart&&p<release;
 set(scenes.flight,isPlane?1:0,false);
 const flight=smooth(flightStart,cut,p),bank=smooth(.683,.795,p);
 const approachFlight=smooth(.692,cut,p);
 // Start beyond the left edge on mobile, even with the full aircraft silhouette.
 const x=-w*(planeMobile()?1.32:.79)*(1-smooth(.660,.793,p));
 const y=h*.12*(1-smooth(.660,.800,p));
 const planeScale=.16*Math.exp(Math.log(90/.16)*approachFlight);
 planeFallback.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(-11*(1-bank)).toFixed(2)}deg) scale(${planeScale.toFixed(3)})`;
 // Freeze the renderer for a single flight, so late GLB readiness cannot pop into view.
 if(isPlane&&flightRenderer===null)flightRenderer=plane.classList.contains('has-webgl')?'webgl':'fallback';
 if(!isPlane)flightRenderer=null;
 plane.classList.toggle('qa15-flight-fallback',flightRenderer==='fallback');
 planeFallback.style.opacity=(flightRenderer==='webgl'||(!isPlane&&plane.classList.contains('has-webgl')))?'0':'1';
 const surface=$('.plane-surface-cover');if(surface)surface.style.opacity=0;
 const trailOpacity=band(.667,.690,.786,.806,p)*.85;
 trails.style.opacity=trailOpacity.toFixed(3);
 trails.style.transform='none';
 // Every contrail endpoint uses a projected turbine mount supplied by WebGL.
 // The fallback follows the visible static aircraft rather than the screen centre.
 const projected=window.LUMO_AIRLINER_ENGINE_POINTS;
 const movingImg=planeFallback.querySelector('img');
 const rect=isPlane&&flightRenderer!=='webgl'?movingImg?.getBoundingClientRect():null,wr=isPlane?world.getBoundingClientRect():null;
 const fallbackPoints=rect?[{x:(rect.left-wr.left+rect.width*.392)/w,y:(rect.top-wr.top+rect.height*.546)/h,tailX:(rect.left-wr.left+rect.width*.44)/w,tailY:(rect.top-wr.top+rect.height*.51)/h},
   {x:(rect.left-wr.left+rect.width*.599)/w,y:(rect.top-wr.top+rect.height*.546)/h,tailX:(rect.left-wr.left+rect.width*.56)/w,tailY:(rect.top-wr.top+rect.height*.51)/h}]:[];
 const positions=flightRenderer==='webgl'&&Array.isArray(projected)&&projected.length===2?projected:fallbackPoints;
 const traces=all('.jet-trace',trails);
 const updateTrails=(points)=>points.forEach((eng,i)=>{
   if(!Number.isFinite(eng.x)||!Number.isFinite(eng.y))return;
   const endX=eng.x*1000,endY=eng.y*600;
   const dx=(sm?175:300)*(1+.25*flight)*1000/w;
   const vertical=(sm?25:42)*600/h;
   const sx=eng.tailX!=null?(eng.tailX-eng.x)*1000:-dx, sy=eng.tailY!=null?(eng.tailY-eng.y)*600:vertical;
   const norm=Math.hypot(sx,sy)||1; const tx=sx/norm*dx,ty=sy/norm*dx;
   traces[i]?.setAttribute('d',`M ${(endX+tx).toFixed(1)} ${(endY+ty).toFixed(1)} C ${(endX+tx*.68).toFixed(1)} ${(endY+ty*.58).toFixed(1)}, ${(endX+tx*.15).toFixed(1)} ${(endY+ty*.08).toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`);
 });
 window.LUMO_UPDATE_TRAILS=updateTrails; if(isPlane&&trailOpacity>.001)updateTrails(positions);
 trails.style.setProperty('--trail-offset',String((1-flight)*330));
 const flightCopy=$('.flight-copy');if(flightCopy)flightCopy.style.opacity=(1-smooth(.758,.798,p)).toFixed(4);
 // No crossfade at the cut. Scene is already prepared underneath the aircraft.
 set(scenes.process,p>=.817&&p<.963?1:0,p>=.823&&p<.936);
 
 // The scene settles first; orbiting only starts after further wheel movement.
 const processProgress=clamp((p-.850)/.082);
 const orbitRotation=processProgress*Math.PI*2;
 const rx=sm?Math.min(155,w*.32):Math.min(w*.19,280),rz=sm?120:215,ry=sm?Math.min(36,h*.052):49;
 orbitCards.forEach((card,i)=>{
  const theta=i*Math.PI*2/5-orbitRotation;
  const x=Math.sin(theta)*rx;
  const z=Math.cos(theta)*rz;
  const y=sm?Math.cos(theta)*ry:Math.sin(theta+Math.PI/5)*ry;
  const yaw=theta*180/Math.PI;
  const scale=.78+.22*(z/rz+1)/2;
  card.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,${z.toFixed(2)}px) rotateY(${yaw.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  card.style.zIndex=String(1000+Math.round(z));
  card.style.opacity="1";
  const front=card.querySelector('.orbit-front'),back=card.querySelector('.orbit-back');
  if(front&&back){front.style.visibility='visible';back.style.visibility='visible';card.dataset.side=Math.cos(theta)>=0?'front':'back'}
 });
 processEditorial.style.transform="none";
 const orbitActive=Math.round(processProgress*5)%5;
 if(orbitActive!==lastOrbit){lastOrbit=orbitActive;const live=$('#orbit-live');if(live)live.textContent=['Обсуждение','Концепция','Разработка','Проверка','Запуск'][orbitActive]}
 // Final reveals a fresh smoky composition; no recycled static ending.
 const finalIn=smooth(.936,.956,p);
 set(scenes.end,p>=.936?1:0);
 if(window.LUMO_SHATTER)window.LUMO_SHATTER(p,scenes.process,scenes.end);
 endInner.style.transform='none'; endInner.style.opacity=p>=.936?'1':'0';
 const onLight=(p>=.253&&p<.516)||(p>=.823&&p<.936);
 header.classList.toggle('on-light',onLight);document.body.classList.toggle('on-light',onLight);header.classList.toggle('qa6-process-nav',p>=.823&&p<.936);if(p>=.823&&p<.936){header.classList.remove('on-light');document.body.classList.remove('on-light')}
 header.classList.remove('scrolled');
 const navAlpha=(1-band(.17,.21,.255,.275,p))*(1-band(.790,.807,.823,.837,p))*(1-band(.932,.936,.959,.968,p));
 header.style.opacity=navAlpha.toFixed(3);header.style.pointerEvents=navAlpha>.95?'auto':'none';header.style.visibility=navAlpha>.005?'visible':'hidden';
 for(const [name,video] of Object.entries(videos)){
  const active=scenes[name].classList.contains('is-active')&&!document.hidden&&(name!=='process'||(p<.936&&!scenes.process.classList.contains('qa6-frozen')));
  if(!video)continue;
  playScene(video,active);
 }
 if(p>.35&&!modelLoading&&!modelLoaded)start3D();if(p>.44&&p<.57&&videos.device?.preload==='none')videos.device.preload='metadata';if(p>.68&&p<.81&&videos.process?.preload==='none')videos.process.preload='metadata';
 document.dispatchEvent(new Event('lumo-cinema-update'));
}
function source(){const r=root.getBoundingClientRect();return r.top>=-2?0:clamp(-r.top/spanHeight())}
function schedule(){if(!raf)raf=requestAnimationFrame(tick)}
function tick(t){raf=0;syncViewport();const delta=Math.min(.20,Math.max(.005,(t-lastTime)/1000||.016));lastTime=t;target=snapEndpoint(source());
 if(!activeGate&&t<resizeUntil){target=current=previousSource=resizeHold;scrollProgress(resizeHold);render(current);schedule();return;}
 if(gateTick(t,target))return;
 const response=reduced?1:(1-Math.exp(-delta*(mobile.matches?((target>=.286&&target<.49)?5.8:8):7.5)));
 current=target===0?0:lerp(current,target,response);
 if(Math.abs(current-target)<.000025)current=target;
 render(current);
 if(current!==target)schedule();
}
function syncViewport(){const span=spanHeight(),widthChanged=lastViewW!==innerWidth;const changed=widthChanged||lastViewH!==innerHeight||(lastSpan>0&&Math.abs(span-lastSpan)>2);lastViewW=innerWidth;lastViewH=innerHeight;lastSpan=span;if(!changed||activeGate||reduced)return;
 // The sticky world is released when the root bottom reaches its own height, not zero.
 // Mobile browser chrome can change height during a swipe. Never pull a reader back from the final scene or footer.
 const pastSticky=root.getBoundingClientRect().bottom<=world.clientHeight+4;
 if(pastSticky||(mobileViewport()&&!widthChanged&&previousSource>=sandTo-gateTolerance())){resizeUntil=0;target=snapEndpoint(source());if(previousSource>=sandTo&&target<sandTo){target=sandTo;scrollProgress(sandTo)}current=previousSource=target;return;}
 resizeHold=performance.now()<resizeUntil?resizeHold:previousSource;resizeUntil=performance.now()+430;target=current=previousSource=resizeHold;scrollProgress(resizeHold);}
function resize(){syncViewport();measureAnchor();schedule()}
// A restored document must never resume a half-painted intro or an unfinished gate.
function resetIntro(){if(reduced){window.scrollTo({top:0,behavior:"instant"});return;}if(raf)cancelAnimationFrame(raf);raf=0;activeGate=null;flightAuto=null;flightDone=false;lastTime=0;lastPair=-1;lastOrbit=-1;current=target=previousSource=0;document.body.classList.remove('qa5-transition-running');delete document.body.dataset.transition;delete document.body.dataset.direction;window.scrollTo({top:0,behavior:'instant'});measureAnchor();render(0);schedule();}
function homeLink(e){const a=e.target.closest?.('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;if(!/^(?:\.\/)?index\.html(?:#(?:main)?)?$/.test(a.getAttribute('href')||''))return;e.preventDefault();resetIntro();}
document.addEventListener('click',homeLink);
if('scrollRestoration' in history)history.scrollRestoration='manual';
addEventListener('pageshow',e=>{if(reduced)return;if(!location.hash){resetIntro();requestAnimationFrame(()=>{if(scrollY<3)render(0)});}else resize();});
addEventListener('pagereveal',e=>{if(e.viewTransition){e.viewTransition.skipTransition();}if(!location.hash)resetIntro();});
if(reduced){document.body.classList.add('lumo-static'); for(const scene of Object.values(scenes))scene.style.removeProperty('visibility'); return;}
addEventListener('wheel',e=>{if(e.ctrlKey||e.target.closest?.('#site-header,.mobile-nav,.preview-overlay')||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;if(activeGate){e.preventDefault();return}const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);if(Math.abs(d)>1&&requestInput(Math.sign(d),Math.abs(d)))e.preventDefault()},{passive:false});
addEventListener('touchstart',e=>{modelGesture=(mobile.matches||matchMedia("(pointer:coarse) and (max-height:600px)").matches)&&!!e.target.closest?.(".device-model");const ignore=modelGesture||e.touches.length!==1||e.target.closest?.('#site-header,.mobile-nav,.preview-overlay,input,textarea,select,button');touchStartY=ignore?null:e.touches[0].clientY;touchStartX=ignore?null:e.touches[0].clientX;touchDirection=null},{passive:true});
addEventListener('touchmove',e=>{if(modelGesture){if(e.cancelable)e.preventDefault();return;}if(e.touches.length!==1||touchStartY===null)return;const y=e.touches[0].clientY,x=e.touches[0].clientX,d=touchStartY-y,dx=touchStartX-x;if(!touchDirection&&Math.max(Math.abs(dx),Math.abs(d))>8)touchDirection=Math.abs(d)>Math.abs(dx)*1.15?'vertical':'horizontal';if(touchDirection!=='vertical')return;if(activeGate){if(e.cancelable)e.preventDefault();return}if(Math.abs(d)>16&&requestInput(Math.sign(d),Math.abs(d))&&e.cancelable)e.preventDefault();},{passive:false});
for(const type of ['touchend','touchcancel'])addEventListener(type,()=>{touchStartY=touchStartX=touchDirection=null;modelGesture=false},{passive:true});
addEventListener('keydown',e=>{if(e.target.closest?.('input,textarea,select,button,a,[contenteditable],#site-header,.preview-overlay')||document.body.classList.contains('is-menu-open'))return;const d=['ArrowDown','PageDown',' '].includes(e.key)?1:['ArrowUp','PageUp'].includes(e.key)?-1:0;if(d&&(activeGate||requestInput(e.shiftKey?-d:d,e.key.startsWith('Arrow')?80:innerHeight*.8)))e.preventDefault()});addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize,{passive:true});
addEventListener('pageshow',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);window.visualViewport?.addEventListener('resize',resize,{passive:true});
addEventListener('pointermove',e=>{
 if(e.pointerType==='touch')return;
 const x=(e.clientX/innerWidth-.5)*90,y=(e.clientY/innerHeight-.5)*90;
 scenes.device.style.setProperty('--mx',`${x.toFixed(1)}px`);
 scenes.device.style.setProperty('--my',`${y.toFixed(1)}px`);
},{passive:true});
if(document.fonts?.ready)document.fonts.ready.then(resize).catch(()=>{});
if(!location.hash)window.scrollTo({top:0,behavior:'instant'});measureAnchor();lastSpan=spanHeight();target=source();for(const g of gates){if(target>g.from&&target<g.to){target=target<(g.from+g.to)/2?g.from-.00012:g.to;scrollProgress(target)}}current=target;previousSource=target;flightDone=target>=flightTo;render(current);
if(new URLSearchParams(location.search).has("qa")){window.LUMO_QA_RENDER=render;window.LUMO_QA_GATE=(name,reverse,t=performance.now())=>startGate(gates.find(g=>g.name===name),reverse,t);}
window.LUMO_JOURNEY_DEBUG=()=>({progress:current,target,activePair:lastPair,orbitStep:lastOrbit,modelLoaded,modelLoading,flightAuto:!!flightAuto,flightDone,gate:activeGate?.g.name||null,reverse:activeGate?.reverse||false,scene:current<.244?'intro':current<.489?'gallery':current<.575?'tunnel':current<.660?'device':current<.823?'flight':current<.936?'process':'end'});
})();
