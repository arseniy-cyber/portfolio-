/* LUMO Sites 10.18 — scoped fixes; contact form and mobile lab intentionally untouched. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const mobile=matchMedia('(max-width:780px)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const debug={version:'10.18',water:false,services:0,servicesFlipped:0,lab:'unchanged',bookMark:false};
window.LUMO_V1018_DEBUG=()=>({...debug});
const phoneHint=$('.gltf-scene--phone .phone-drag-hint');if(phoneHint)phoneHint.textContent=mobile.matches?'Проведи пальцем, чтобы повернуть':'Поверни мышью или пальцем';
const water=$('.film-stage__video');if(water){debug.water=!!water.querySelector('source[src*="green-texture.mp4"]');water.muted=true;water.playsInline=true;water.play().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(!document.hidden)water.play().catch(()=>{})});}
// Cards: replace system orb with a line-drawn SVG in the approved action treatment.
const arrow='<span class="v1018-action-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 12h14"/><path d="M13 5l7 7-7 7"/></svg></span>';
for(const action of $$('.selected__reveal-action,.portfolio-tile__open')){
 const old=$('.portfolio-tile__orb,.v1017-arrow,.v1015-arrow',action);old?.remove();
 if(!$('.v1018-action-arrow',action))action.insertAdjacentHTML('beforeend',arrow);
}
// On mobile, services should behave exactly like the work cards: one clear
// flip button on the front, one return button on the back, and no extra clones.
if(mobile.matches){
 const flipIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 10.5a7.5 7.5 0 1 0-2.8 6.1"/><path d="M19.5 4v6.5H13"/></svg>';
 for(const card of $$('.service-flip')){
  const front=$('.service-flip__front',card),back=$('.service-flip__back',card),orig=$('.service-flip__toggle',card);
  if(!front||!back||!orig)continue;
  card.classList.add('v1016-service','v1018-service-clean');
  $$('.v1018-service-control,.v1016-service-return',card).forEach(btn=>btn.remove());
  const frontHint=$('.service-flip__front-hint',front); if(frontHint) frontHint.hidden=true;
  const frontBtn=orig.cloneNode(false);
  frontBtn.type='button';
  frontBtn.className='service-flip__toggle v1017-service-turn v1018-service-turn';
  frontBtn.removeAttribute('aria-hidden'); frontBtn.tabIndex=0; frontBtn.innerHTML=flipIcon;
  frontBtn.setAttribute('aria-label','Перевернуть карточку услуги');
  orig.replaceWith(frontBtn);
  if(frontBtn.parentElement!==front) front.append(frontBtn);
  let backBtn=$('.v1017-service-turn--back',back);
  if(backBtn){
   const cleanBack=backBtn.cloneNode(false);
   cleanBack.type='button';
   cleanBack.className='v1017-service-turn v1017-service-turn--back v1018-service-turn';
   cleanBack.setAttribute('aria-label','Вернуться к лицевой стороне');
   cleanBack.innerHTML=flipIcon;
   backBtn.replaceWith(cleanBack);
   backBtn=cleanBack;
  }else{
   backBtn=document.createElement('button');
   backBtn.type='button';
   backBtn.className='v1017-service-turn v1017-service-turn--back v1018-service-turn';
   backBtn.setAttribute('aria-label','Вернуться к лицевой стороне');
   backBtn.innerHTML=flipIcon;
   back.append(backBtn);
  }
  const set=(on)=>{
   card.classList.toggle('is-flipped',on);
   card.classList.toggle('manual-front',!on);
   card.setAttribute('aria-expanded',String(on));
   frontBtn.setAttribute('aria-expanded',String(on));
   frontBtn.tabIndex=on?-1:0; backBtn.tabIndex=on?0:-1;
   debug.servicesFlipped++;
  };
  frontBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();set(true)});
  backBtn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();set(false)});
  card.addEventListener('click',e=>{
   if(e.target.closest('a'))return;
   if(!e.target.closest('.v1017-service-turn')){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  card.addEventListener('keydown',e=>{if(e.key==='Escape'&&card.classList.contains('is-flipped')){e.preventDefault();set(false);frontBtn.focus({preventScroll:true});}},true);
  set(false); debug.services++;
 }
}

// The book mark is an original engraved Lumo stroke (not a copied third-party logo).
debug.bookMark=!!$('.v1017-cover-mark svg');
// Desk / tablet: keep all six AURA settings and its original controls intact.
// The miniature site has its OWN scrollport, sized to the visible viewport rather
// than making the host page scroll through a 1600px virtual mobile page.
const stage=$('#lab-stage'),frame=$('#lab-frame'),viewer=$('.lab-viewer');
if(stage&&frame&&viewer&&!mobile.matches){
 const modes={desktop:1280,tablet:820,phone:390};let mode=$('.lab-viewer__devices .is-active')?.dataset.device||'desktop';
 let pending=0;
 const fit=()=>{
  pending=0;const virtualWidth=modes[mode]||1280;
  const bar=$('.lab-viewer__bar',viewer),hint=$('.lab-viewer__hint',viewer);
  const style=getComputedStyle(viewer);
  const availWidth=Math.max(200,viewer.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-2);
  const scale=Math.min(1,availWidth/virtualWidth);
  const availHeight=Math.max(245,viewer.clientHeight-(bar?.offsetHeight||62)-(hint?.offsetHeight||25)-39);
  const displayedWidth=Math.floor(virtualWidth*scale);
  const displayedHeight=Math.floor(availHeight);
  stage.style.setProperty('--v1015-frame-width',virtualWidth+'px');
  stage.style.setProperty('--v1015-frame-height',Math.ceil(displayedHeight/scale)+'px');
  stage.style.setProperty('--v1015-frame-scale',String(scale));
  stage.style.setProperty('--v1018-stage-width',displayedWidth+'px');stage.style.setProperty('--v1018-stage-height',displayedHeight+'px');stage.style.width=displayedWidth+'px';stage.style.height=displayedHeight+'px';
  frame.style.width=virtualWidth+'px';frame.style.height=Math.ceil(displayedHeight/scale)+'px';
  frame.style.transform='scale('+scale+')';frame.style.transformOrigin='top left';
  stage.dataset.virtualDevice=mode;
  debug.lab=mode;
 };
 const schedule=()=>{if(!pending)pending=requestAnimationFrame(fit)};
 for(const btn of $$('.lab-viewer__devices [data-device]'))btn.addEventListener('click',()=>{mode=btn.dataset.device;schedule()});
 window.addEventListener('resize',schedule,{passive:true});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(schedule).observe(viewer);
 schedule();
}
})();
