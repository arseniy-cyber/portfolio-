/* Cross-page authored spatial transitions and scroll-triggered interior effects.
   Native links remain functional without JavaScript. No external CDN dependence. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
const narrow=matchMedia('(max-width:940px)').matches;const cards=[...document.querySelectorAll('.catalogue-item,.service-row,.process-step-page')].filter(e=>!narrow||!e.classList.contains('service-row'));
if(!reduced){
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;entry.target.classList.add('directed-in');observer.unobserve(entry.target)}
 },{threshold:.10,rootMargin:'0px 0px -9% 0px'});
 cards.forEach((card,i)=>{card.classList.add('directed-reveal');card.style.setProperty('--reveal-delay',`${(i%3)*0.09}s`);observer.observe(card)});
}
// Scroll-driven service focus, each row receives its own contextual material instead of a generic hover.
const serviceRows=[...document.querySelectorAll('.service-row')];
if(serviceRows.length&&!reduced&&!narrow){
 const images=['lav-parfum','lumo-parfum','iphone','mmrsiq','detailing','sad-kofe','shurubor'];
 serviceRows.forEach((row,i)=>row.style.setProperty('--service-image',`url(assets/img/editorial/${images[i%images.length]}.webp)`));
 let active=-1;
 const focus=()=>{
  const center=innerHeight*.53;
  let best=-1,dist=Infinity;
  serviceRows.forEach((row,i)=>{
   const r=row.getBoundingClientRect();
   const d=Math.abs((r.top+r.bottom)/2-center);
   if(d<dist){dist=d;best=i}
  });
  if(best!==active){active=best;serviceRows.forEach((r,i)=>r.classList.toggle('is-in-focus',i===best))}
 };
 addEventListener('scroll',focus,{passive:true});addEventListener('resize',focus,{passive:true});focus();
}
// A restrained magnetic cursor response, integrated into real interactive elements.
if(fine&&!reduced){
 document.querySelectorAll('.contact-pill,.main-cta,.catalogue-thumb,.form-send').forEach(el=>{
  let target={x:0,y:0},actual={x:0,y:0},id=0;
  const frame=()=>{actual.x+=(target.x-actual.x)*.15;actual.y+=(target.y-actual.y)*.15;
   el.style.setProperty('--mag-x',actual.x.toFixed(2)+'px');el.style.setProperty('--mag-y',actual.y.toFixed(2)+'px');
   if(Math.abs(actual.x-target.x)+Math.abs(actual.y-target.y)>.06)id=requestAnimationFrame(frame);else id=0;
  };
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();target.x=(e.clientX-r.left-r.width/2)*.07;target.y=(e.clientY-r.top-r.height/2)*.09;if(!id)id=requestAnimationFrame(frame)},{passive:true});
  el.addEventListener('pointerleave',()=>{target={x:0,y:0};if(!id)id=requestAnimationFrame(frame)},{passive:true});
 });
}
})();
