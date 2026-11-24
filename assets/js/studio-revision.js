/* Lumo Sites Studio Revision: interaction, accessibility and navigation.
   Keeps wheel/touch scroll native; no timing assumptions about hardware. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
// Interactive tint is pointer-local and paint-only; links stay fully semantic.
if(fine&&!reduced){
 for(const el of $$('.contact-pill,.main-cta,.form-send,.intro-discover')){
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--pointer-x',`${((e.clientX-r.left)/r.width*100).toFixed(2)}%`);el.style.setProperty('--pointer-y',`${((e.clientY-r.top)/r.height*100).toFixed(2)}%`)},{passive:true});
 }
}
// Page typography and informational cards reveal once. No listener-created loops.
if(!reduced&&'IntersectionObserver' in window){
 const targets=$$('.studio-approach-card,.studio-case-detail,.contact-left p,.services-after');
 const io=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('studio-visible');io.unobserve(entry.target)}}
 },{threshold:.08,rootMargin:'0px 0px -8% 0px'});
 targets.forEach(node=>{node.classList.add('studio-reveal');io.observe(node)});
 // Subtle masked text reveal with a brief thin caret, never letter-by-letter reflow.
 const heads=$$('.studio-approach-heading,.studio-approach-card h3,.contact-left h2');
 const oi=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('studio-reveal-text-on');oi.unobserve(entry.target)}}
 },{threshold:.2});
 heads.forEach(h=>{h.classList.add('studio-reveal-text');oi.observe(h)});
}
// Keep a genuine focus destination when the page opens from an internal link.

// Small deterministic introspection function used by the independent QA run.
window.LUMO_STUDIO_STATUS=()=>({
 brand:$$('.word-logo').map(e=>e.textContent.replace(/\s+/g,' ').trim()),
 cutoutSculptures:$$('.statue-photo').filter(e=>(e.getAttribute('style')||'').includes('sculptures/study')).length,
 totalProjects:$$('.rail-work').length,
 videoUsage:{device:$$('source[src="assets/video/device-loop.mp4"]').length,tunnel:$$('source[src="assets/video/interspace-forest-grade.mp4"]').length},
 page:document.body.dataset.page||'home',
 navigationFold:CSS.supports('view-transition-name: root'),
 reducedMotion:reduced
});
})();
