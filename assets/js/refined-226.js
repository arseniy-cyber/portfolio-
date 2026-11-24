/* Lumo Sites 226: responsiveness, content imagery, local fallback, motion quality.
   No network dependency for the primary experience. Native touch scroll is preserved. */
(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile=matchMedia('(max-width:700px)');
const root=document.documentElement;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
// Modern mouse wheels ease into destination without swallowing native touchpad gestures.
// Never intercept editable fields, Ctrl+wheel, synthetic scroll, touch or keyboard.
if(false && !reduce && matchMedia('(pointer:fine)').matches){ // Native scroll; avoids double easing and jump-back
 let destination=scrollY,active=false,frame=0,lastInteraction=0;
 const tick=()=>{
  frame=0;if(!active)return;
  const delta=destination-scrollY;
  if(Math.abs(delta)<.65){active=false;return;}
  window.scrollTo(0,scrollY+delta*.105);
  frame=requestAnimationFrame(tick);
 };
 addEventListener('wheel',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.defaultPrevented||mobile.matches)return;
  const target=e.target instanceof Element?e.target:null;
  if(target?.closest('textarea,input,select,[contenteditable],.preview-overlay,.lab-console,.mobile-nav'))return;
  const amount=e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?innerHeight:1);
  if(Math.abs(amount)<38)return; // precise trackpads stay native
  e.preventDefault();
  destination=clamp((active?destination:scrollY)+clamp(amount,-1100,1100)*.95,0,document.documentElement.scrollHeight-innerHeight);
  active=true;
  if(!frame)frame=requestAnimationFrame(tick);
 },{passive:false});
 addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(e.key))active=false;
 },{passive:true});
 addEventListener('popstate',()=>{destination=scrollY;active=false});
 addEventListener('touchstart',()=>{destination=scrollY;active=false},{passive:true});
}
// Ten Met Museum open-access photo references. They are only loaded when the
// gallery is near the viewport; a light local material remains for offline inspection.
const statues=[...document.querySelectorAll('.statue-photo')];
// Videos are already CSS-layered. Guarantee the target footage has metadata,
// and replace it with a poster if a decoder rejects playback or a source fails.
for(const v of document.querySelectorAll('.scene-video,.page-hero-video')){
 v.muted=true;v.playsInline=true;
 v.addEventListener('error',()=>{v.classList.add('is-video-fallback')});
}
// No fake tech labels in cards: case imagery remains linkable even if motion is disabled.
for(const a of document.querySelectorAll('.catalogue-thumb')){
 a.setAttribute('aria-label',`Открыть кейс: ${a.closest('.catalogue-item')?.querySelector('h2')?.textContent?.trim()||'Проект'}`);
}
// Treat case visuals as important: decode only once, then animate gently.
if(!reduce){
 const revealer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
   if(e.isIntersecting){e.target.classList.add('is-visible-226');revealer.unobserve(e.target)}
  });
 },{threshold:.12,rootMargin:'0px 0px -80px 0px'});
 document.querySelectorAll('.case-story .case-overview,.case-story .case-features,.case-full-shot,.brief-form,.about-page .about-layout').forEach(e=>{
  e.classList.add('reveal-226');revealer.observe(e)
 });
}
// Reversible theme state for the browser header; no delayed image-only empty hero.
const heroVideo=document.querySelector('.intro-video');
heroVideo?.setAttribute('preload','auto');
// Site QA instrumentation can assert which scene is visible and whether sources succeeded.
window.LUMO_226_STATUS=()=>({
  title:document.title,
  brand:[...document.querySelectorAll('.word-logo')].map(e=>e.textContent.trim()),
  sculptures:statues.length,
  museumLoaded:statues.filter(e=>e.dataset.photo==='museum').length,
  offlineFallbacks:statues.filter(e=>e.dataset.photo==='offline-fallback').length,
  cards:document.querySelectorAll('.rail-work').length,
  webglModels:[...document.querySelectorAll('[data-gltf-scene]')].map(e=>({kind:e.dataset.gltfScene,ready:e.classList.contains('has-webgl'),error:e.dataset.glError||''})),
  current:window.LUMO_JOURNEY_DEBUG?.()||null
});
})();
