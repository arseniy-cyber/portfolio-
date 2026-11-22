/* LUMO SITES V10.17 — focused interaction corrections to V10.16.
   All changes are progressive; no change to client-provided images/models. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const mobile=matchMedia('(max-width:780px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const status={version:'10.17',loader:false,sceneReady:[],serviceReturnButtons:0,labMode:'desktop',book:'none'};
window.LUMO_V1017_DEBUG=()=>({...status});

// First visit uses an actual readiness gate, without an invented progress percentage.
const loader=$('.v1017-loader');
if(loader && document.documentElement.classList.contains('v1017-awaiting')){
 status.loader=true;
 const state=$('#v1017-loading-status'),start=performance.now();
 const home=document.body.classList.contains('home');
 const readyScenes=new Set();
 const finish=()=>{
  if(!status.loader)return;
  status.loader=false;
  document.documentElement.classList.remove('v1017-awaiting');
  document.documentElement.classList.add('v1017-ready');
  document.dispatchEvent(new Event('lumo-site-ready'));
  loader.addEventListener('transitionend',()=>loader.remove(),{once:true});
  setTimeout(()=>loader.remove(),850);
  window.dispatchEvent(new Event('scroll'));
 };
 document.addEventListener('lumo-scene-ready',event=>{if(event.detail?.kind){readyScenes.add(event.detail.kind);status.sceneReady=[...readyScenes];}}, {passive:true});
 const stage=async()=>{
  if(home&&!location.hash){try{if(performance.getEntriesByType('navigation')[0]?.type==='navigate')scrollTo(0,0)}catch(_){}}
  state.textContent='Подготовка шрифтов и интерфейса';
  await Promise.race([document.fonts?.ready||Promise.resolve(),new Promise(r=>setTimeout(r,1900))]);
  const heroImg=$('.chapter--hero img,.subhero img,.case-hero img');
  if(heroImg&&!heroImg.complete){await Promise.race([heroImg.decode?.().catch(()=>{})||Promise.resolve(),new Promise(r=>setTimeout(r,1700))]);}
  if(home){
   state.textContent='Подготовка 3D-сцен';
   const until=performance.now()+4200;
   while(performance.now()<until){
    const sc=window.LUMO_3D_DEBUG?.()||[];
    if(sc.length>=3&&sc.every(s=>s.ready||s.error))break;
    await new Promise(r=>setTimeout(r,120));
   }
  }
  state.textContent='Готово';
  await new Promise(r=>setTimeout(r,reduced?0:140));
  finish();
 };
 // Absolute fail-safe: an unavailable resource must never trap a visitor.
 const failsafe=setTimeout(finish,8200);
 stage().catch(()=>finish()).finally(()=>clearTimeout(failsafe));
 window.addEventListener('pageshow',e=>{if(e.persisted)finish()});
}

// A non-clickable editorial text sequence adds life to the first mobile screen.
const editorial=$('.v1017-hero-editorial');
if(editorial){const lines=$$('.v1017-editorial-line',editorial);let active=0;
 if(!reduced&&lines.length>1){
  const timer=setInterval(()=>{
   if(document.hidden||!editorial.getBoundingClientRect().width)return;
   const section=editorial.closest('#hero');const r=section?.getBoundingClientRect();
   if(r&&(r.bottom<0||r.top>innerHeight))return;
   lines[active].classList.remove('is-current');active=(active+1)%lines.length;lines[active].classList.add('is-current');
  },3700);
  window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
 }
}

// Service cards: add real back-face controls; the existing flip listener handles the front.
// One tap always takes effect, no hover dependency and no duplicate event dispatch.
if(mobile.matches){
 for(const card of $$('.service-flip')){
  const front=$('.service-flip__front',card),back=$('.service-flip__back',card);
  const frontButton=$('.service-flip__toggle',card);
  if(!front||!back||!frontButton)continue;
  front.append(frontButton);
  frontButton.classList.add('v1017-service-turn');
  frontButton.removeAttribute('aria-hidden');frontButton.tabIndex=0;
  frontButton.setAttribute('aria-label','Перевернуть карточку услуги');
  if(!$('.v1017-service-turn--back',back)){
   const btn=document.createElement('button');btn.type='button';btn.className='v1017-service-turn v1017-service-turn--back';btn.setAttribute('aria-label','Вернуться к лицевой стороне');
   btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10M17 7 7 17"/><path d="M3 12a9 9 0 0 1 9-9" opacity=".65"/></svg>';
   back.append(btn);
   btn.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();card.classList.remove('is-flipped');card.classList.add('manual-front');card.setAttribute('aria-expanded','false');frontButton.setAttribute('aria-expanded','false');frontButton.focus({preventScroll:true});});
   status.serviceReturnButtons++;
  }
  frontButton.addEventListener('click',()=>{card.setAttribute('aria-expanded',String(card.classList.contains('is-flipped')));});
 }
}

// The supplied V10.16 cover used display:none, which prevented a reverse close animation.
// Capture precisely the existing controls; six original pages and page-turn logic stay intact.
const book=$('.v1016-book');
if(book){
 const open=$('.v1016-cover-open',book),close=$('.v1016-cover-close',book),cover=$('.v1016-book-cover',book);
 let moving=false;const D=reduced?0:850;
 status.book=book.classList.contains('is-closed')?'closed':'open';
 if(cover)cover.setAttribute('aria-hidden','false');
 open?.addEventListener('click',e=>{
  e.preventDefault();e.stopImmediatePropagation();if(moving||!book.classList.contains('is-closed'))return;
  moving=true;status.book='opening';book.classList.add('is-opening');book.classList.remove('is-closed','is-closing');
  setTimeout(()=>{book.classList.remove('is-opening');book.classList.add('is-open');status.book='open';moving=false;},D);
 },true);
 close?.addEventListener('click',e=>{
  e.preventDefault();e.stopImmediatePropagation();if(moving||book.classList.contains('is-closed'))return;
  moving=true;status.book='closing';
  // Reset original six pages so closing always returns to the opening leaf.
  book.lumoReset?.();
  book.classList.remove('is-open','is-opening');book.classList.add('is-closing');
  setTimeout(()=>{book.classList.remove('is-closing');book.classList.add('is-closed');status.book='closed';moving=false;open?.focus({preventScroll:true})},D);
 },true);
}

// Laboratory device preview: same six selections, but a correctly sized virtual
// viewport for ALL host devices. The stage itself shrinks; no blank white panel.
const labStage=$('#lab-stage'),labFrame=$('#lab-frame');
if(labStage&&labFrame&&matchMedia('(max-width:780px)').matches){
 const viewer=labStage.closest('.lab-viewer');const modes={desktop:[1280,1180],tablet:[820,1260],phone:[390,1680]};let mode=$('.lab-viewer__devices .is-active')?.dataset.device||'desktop';
 let framePending=0;
 const apply=()=>{
  framePending=0;
  const [w,h]=modes[mode]||modes.desktop;
  const cw=Math.max(220,(viewer?.clientWidth||innerWidth)-((viewer?parseFloat(getComputedStyle(viewer).paddingLeft)+parseFloat(getComputedStyle(viewer).paddingRight):0)||0)-2);
  const scale=Math.min(1,cw/w);
  labStage.style.setProperty('--v1017-scale',String(scale));
  labStage.style.setProperty('--v1015-frame-width',w+'px');
  labStage.style.setProperty('--v1015-frame-height',h+'px');
  labStage.style.setProperty('--v1015-frame-scale',String(scale));
  labStage.style.width=Math.ceil(w*scale)+'px';labStage.style.maxWidth='100%';labStage.style.height=Math.ceil(h*scale)+'px';
  labFrame.style.width=w+'px';labFrame.style.height=h+'px';labFrame.style.maxWidth='none';labFrame.style.transform='scale('+scale+')';
  labFrame.style.transformOrigin='top left';
  status.labMode=mode;
 };
 const schedule=()=>{if(!framePending)framePending=requestAnimationFrame(apply)};
 $$('[data-device]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.device||'desktop';schedule()}));
 if(typeof ResizeObserver!=='undefined'){new ResizeObserver(schedule).observe(viewer||labStage);}else window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('resize',schedule,{passive:true});
 schedule();
}
})();
